'use client';

import PerfomaxCard from '@/components/cards/perfomax-card';
import ChartDownloadButtons from '@/components/charts/chart-download-buttons';
import { CustomTooltip } from '@/components/charts/custom-tooltip';
import {
  SyncCursorOverlay,
  useSyncCursorStore,
} from '@/components/charts/sync-cursor';
import { useCallback, useMemo, useRef } from 'react';

import cn from '@/utils/class-names';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

/** Custom X-axis tick — date on top, time below */
function DateTimeTick({ x, y, payload }: any) {
  const raw = payload.value as string;
  const d = new Date(raw);
  const datePart = d.toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  });
  const timePart = d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={10} textAnchor="middle" fontSize={8} fill="#9FA6B5">
        {datePart}
      </text>
      <text x={0} y={0} dy={20} textAnchor="middle" fontSize={8} fill="#9FA6B5">
        {timePart}
      </text>
    </g>
  );
}

const LINE_COLORS = [
  '#3B82F6', // blue
  '#EF4444', // red
  '#22C55E', // green
  '#F59E0B', // amber
  '#A855F7', // purple
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316', // orange
  '#84CC16', // lime
];

const X_AXIS_PADDING = { left: 10, right: 10 };

export interface SensorSeries {
  /** The data key to extract from each SensorDataPoint, e.g. 'tc_rpm' */
  dataKey: string;
  /** Display label in legend/tooltip */
  label: string;
  /** Optional fixed color; otherwise auto-assigned */
  color?: string;
}

interface SensorLineChartProps {
  title: string;
  yAxisLabel: string;
  series: SensorSeries[];
  data: Record<string, unknown>[];
  isLoading?: boolean;
  className?: string;
  thresholds?: { min?: number; max?: number };
  tooltipColumns?: number;
  /**
   * Unique id within a <SyncCursorProvider>. When provided, this chart will
   * publish hover timestamps to the shared store and display a sync line
   * when another chart in the same group is hovered.
   */
  syncCursorId?: string;
}

export default function SensorLineChart({
  title,
  yAxisLabel,
  series,
  data,
  isLoading,
  className,
  thresholds,
  tooltipColumns,
  syncCursorId,
}: SensorLineChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const syncStore = useSyncCursorStore();

  // ── Memoized chart data processing ─────────────────────────────────────
  // All the heavy work (rounding, min/max, gradient stops, Y-axis domain,
  // timestamp index) lives inside one memo so the chart does not recompute
  // on every render — e.g. when a parent re-renders for an unrelated reason.
  const {
    chartData,
    timestamps,
    overallMin,
    overallMax,
    domainMin,
    domainMax,
    seriesRanges,
  } = useMemo(() => {
    const keys = series.map((s) => s.dataKey);
    let oMin = Infinity;
    let oMax = -Infinity;

    // Per-series min/max, collected in a single pass.
    const perSeries: Record<string, { min: number; max: number }> = {};
    for (const key of keys) perSeries[key] = { min: Infinity, max: -Infinity };

    const ts: string[] = new Array(data.length);
    const processed: Record<string, unknown>[] = new Array(data.length);

    for (let i = 0; i < data.length; i++) {
      const point = data[i] as Record<string, unknown>;
      const rounded: Record<string, unknown> = { ...point };
      for (const key of keys) {
        const v = point[key];
        if (typeof v === 'number') {
          const val = Math.round(v * 100) / 100;
          rounded[key] = val;
          if (val < oMin) oMin = val;
          if (val > oMax) oMax = val;
          const r = perSeries[key]!;
          if (val < r.min) r.min = val;
          if (val > r.max) r.max = val;
        } else {
          rounded[key] = undefined;
        }
      }
      processed[i] = rounded;
      const t = point.timestamp;
      ts[i] = typeof t === 'string' ? t : String(t ?? '');
    }

    if (oMin === Infinity) oMin = 0;
    if (oMax === -Infinity) oMax = 100;

    const tMin = thresholds?.min;
    const tMax = thresholds?.max;
    let effMin = oMin;
    let effMax = oMax;
    if (tMin !== undefined && tMin < effMin) effMin = tMin;
    if (tMax !== undefined && tMax > effMax) effMax = tMax;

    const padding = (effMax - effMin) * 0.05 || 5;
    const dMin = Math.floor(effMin - padding);
    const dMax = Math.ceil(effMax + padding);

    return {
      chartData: processed,
      timestamps: ts,
      overallMin: oMin,
      overallMax: oMax,
      domainMin: dMin,
      domainMax: dMax,
      seriesRanges: perSeries,
    };
  }, [data, series, thresholds]);

  const hasThresholds =
    thresholds !== undefined &&
    (thresholds.min !== undefined || thresholds.max !== undefined);
  const tMin = thresholds?.min;
  const tMax = thresholds?.max;
  const domainRange = domainMax - domainMin || 1;

  // ── Gradient stop configs per series, memoized ────────────────────────
  const gradientDefs = useMemo(() => {
    if (!hasThresholds) return null;
    return series.map((s, i) => {
      const color = s.color ?? LINE_COLORS[i % LINE_COLORS.length]!;
      const range = seriesRanges[s.dataKey];
      if (!range || range.min === Infinity) return null;

      const { min: lineMin, max: lineMax } = range;
      const effMin = Math.min(lineMin, tMin ?? lineMin);
      const effMax = Math.max(lineMax, tMax ?? lineMax);
      const lineRange = effMax - effMin || 1;

      const topOffset =
        tMax !== undefined
          ? Math.max(0, Math.min(1, (effMax - tMax) / lineRange))
          : 0;
      const bottomOffset =
        tMin !== undefined
          ? Math.max(0, Math.min(1, (effMax - tMin) / lineRange))
          : 1;

      return {
        key: s.dataKey,
        color,
        topOffset,
        bottomOffset,
        showTopDanger: tMax !== undefined && lineMax >= tMax,
        showBottomDanger: tMin !== undefined && lineMin <= tMin,
      };
    });
  }, [hasThresholds, series, seriesRanges, tMin, tMax]);

  // Stroke per series (cached so we don't recompute every render).
  const strokeFor = useMemo(() => {
    return series.map((s, i) => {
      const color = s.color ?? LINE_COLORS[i % LINE_COLORS.length]!;
      if (!hasThresholds) return color;

      const range = seriesRanges[s.dataKey];
      if (!range || range.min === Infinity) return color;
      const isFullySafe =
        (tMax === undefined || range.max < tMax) &&
        (tMin === undefined || range.min > tMin);
      const isFullyAbove = tMax !== undefined && range.min >= tMax;
      const isFullyBelow = tMin !== undefined && range.max <= tMin;
      if (isFullySafe) return color;
      if (isFullyAbove || isFullyBelow) return '#EF4444';
      return `url(#grad-${s.dataKey})`;
    });
  }, [series, seriesRanges, hasThresholds, tMin, tMax]);

  // Fill color (always the base color, independent of danger state).
  const fillFor = useMemo(
    () =>
      series.map((s, i) => s.color ?? LINE_COLORS[i % LINE_COLORS.length]!),
    [series]
  );

  // Stable CSV columns + filename.
  const csvColumns = useMemo(
    () => [
      { key: 'timestamp', label: 'Timestamp' },
      ...series.map((s) => ({ key: s.dataKey, label: s.label })),
    ],
    [series]
  );
  const fileName = useMemo(
    () => title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    [title]
  );

  // ── Publish hover state to sync store (no React re-render) ─────────────
  const handleMouseMove = useCallback(
    (state: any) => {
      if (!syncStore || !syncCursorId) return;
      const label = state?.activeLabel;
      if (typeof label !== 'string' || !label) return;
      syncStore.setState({ timestamp: label, sourceChartId: syncCursorId });
    },
    [syncStore, syncCursorId]
  );

  const handleMouseLeave = useCallback(() => {
    if (!syncStore || !syncCursorId) return;
    // Only clear if this chart is currently the source. Prevents a race when
    // moving between charts: next chart's mousemove may have already fired.
    const current = syncStore.getState();
    if (current.sourceChartId === syncCursorId) {
      syncStore.setState({ timestamp: null, sourceChartId: null });
    }
  }, [syncStore, syncCursorId]);

  const formatVal = (v: number) => v.toFixed(2);

  // ── Legend / header (memoized so headers don't rebuild every frame) ────
  const legend = useMemo(
    () =>
      series.map((s, i) => (
        <span key={s.dataKey} className="flex items-center gap-1.5">
          <span
            className="inline-block h-0.5 w-4"
            style={{
              backgroundColor: s.color ?? LINE_COLORS[i % LINE_COLORS.length],
            }}
          />
          {s.label}
        </span>
      )),
    [series]
  );

  // Avoid "unused variable" warnings when thresholds feature is off.
  void overallMin;
  void overallMax;

  return (
    <PerfomaxCard
      ref={chartRef}
      title={title}
      className={cn('flex flex-col', className)}
      bodyClassName="flex-1"
      action={
        <div className="flex flex-wrap items-center gap-4 text-xs">
          {legend}
          <ChartDownloadButtons
            chartRef={chartRef}
            data={data as Record<string, unknown>[]}
            fileName={fileName}
            csvColumns={csvColumns}
          />
        </div>
      }
    >
      <div className="relative flex h-full min-h-[320px] w-full pb-1 pl-1 pt-1">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm">
            <span className="animate-pulse text-sm font-medium text-muted-foreground">
              Loading...
            </span>
          </div>
        )}

        {/* Y-axis label */}
        <div className="flex flex-col items-center justify-center gap-1 pr-1">
          <span
            className="text-[10px] font-medium text-muted-foreground"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            {yAxisLabel}
          </span>
        </div>

        <div className="flex flex-1 flex-col">
          <div ref={chartContainerRef} className="relative flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{ top: 5, right: 20, left: -15, bottom: 0 }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                <defs>
                  {gradientDefs?.map((g) =>
                    g ? (
                      <linearGradient
                        key={`grad-${g.key}`}
                        id={`grad-${g.key}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        {g.showTopDanger && (
                          <>
                            <stop offset="0%" stopColor="#EF4444" />
                            <stop
                              offset={`${g.topOffset * 100}%`}
                              stopColor="#EF4444"
                            />
                          </>
                        )}
                        <stop
                          offset={
                            g.showTopDanger ? `${g.topOffset * 100}%` : '0%'
                          }
                          stopColor={g.color}
                        />
                        <stop
                          offset={
                            g.showBottomDanger
                              ? `${g.bottomOffset * 100}%`
                              : '100%'
                          }
                          stopColor={g.color}
                        />
                        {g.showBottomDanger && (
                          <>
                            <stop
                              offset={`${g.bottomOffset * 100}%`}
                              stopColor="#EF4444"
                            />
                            <stop offset="100%" stopColor="#EF4444" />
                          </>
                        )}
                      </linearGradient>
                    ) : null
                  )}
                </defs>
                <CartesianGrid
                  vertical={false}
                  stroke="rgba(75, 85, 99, 0.2)"
                  strokeDasharray="3 3"
                />
                <XAxis
                  dataKey="timestamp"
                  tick={<DateTimeTick />}
                  interval={Math.max(0, Math.floor(chartData.length / 8))}
                  height={30}
                  axisLine={{ stroke: '#374151' }}
                  tickLine={false}
                  padding={X_AXIS_PADDING}
                />
                <YAxis
                  domain={[0, hasThresholds ? domainMax : 'auto']}
                  tick={{ fontSize: 10, fill: '#9FA6B5' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatVal}
                />
                <Tooltip
                  isAnimationActive={false}
                  content={(props) => (
                    <CustomTooltip
                      {...props}
                      // Hide the x-axis (timestamp) header on the hovered chart
                      // per UX spec — the values speak for themselves and the
                      // sync line communicates position on other charts.
                      label=""
                      columns={tooltipColumns}
                    />
                  )}
                />
                {tMax !== undefined && (
                  <ReferenceArea
                    y1={tMax}
                    y2={domainMax}
                    fill="rgba(239, 68, 68, 0.15)"
                    strokeOpacity={0}
                  />
                )}
                {tMin !== undefined && (
                  <ReferenceArea
                    y1={domainMin}
                    y2={tMin}
                    fill="rgba(239, 68, 68, 0.15)"
                    strokeOpacity={0}
                  />
                )}
                {series.map((s, i) => (
                  <Area
                    key={s.dataKey}
                    type="natural"
                    dataKey={s.dataKey}
                    name={s.label}
                    stroke={strokeFor[i]}
                    strokeWidth={1.5}
                    fill={fillFor[i]}
                    fillOpacity={0.08}
                    dot={false}
                    connectNulls
                    isAnimationActive={false}
                  />
                ))}
              </ComposedChart>
            </ResponsiveContainer>

            {syncCursorId && (
              <SyncCursorOverlay
                containerRef={chartContainerRef}
                timestamps={timestamps}
                chartId={syncCursorId}
                xAxisPadding={X_AXIS_PADDING}
              />
            )}
          </div>
          <div className="mt-1 flex items-center justify-center">
            <span className="text-[10px] font-medium text-muted-foreground">
              Date / Time
            </span>
          </div>
        </div>
      </div>
    </PerfomaxCard>
  );
}
