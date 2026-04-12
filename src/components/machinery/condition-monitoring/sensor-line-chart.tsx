'use client';

import PerfomaxCard from '@/components/cards/perfomax-card';
import { CustomTooltip } from '@/components/charts/custom-tooltip';

import cn from '@/utils/class-names';
import { useRef } from 'react';
import ChartExportButton from './chart-export-button';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

/** Tooltip header: parse API UTC / ISO timestamps into local, human-readable text */
function formatTooltipTimestampLabel(label: unknown): string {
  if (label == null) return '';
  if (typeof label === 'number' && !Number.isNaN(label)) {
    const d = new Date(label);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    }
  }
  const s = String(label);
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) {
    return d.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }
  return s;
}

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
}: SensorLineChartProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const formatVal = (v: number) => v.toFixed(2);

  // Round numeric values to 2 decimal places and convert nulls to 0
  const dataKeys = series.map((s) => s.dataKey);

  const hasThresholds =
    thresholds &&
    (thresholds.min !== undefined || thresholds.max !== undefined);
  const { min: tMin, max: tMax } = thresholds || {};

  let overallMin = Infinity;
  let overallMax = -Infinity;

  const chartData = data.map((point) => {
    const rounded: Record<string, unknown> = { ...point };
    for (const key of dataKeys) {
      const v = (point as Record<string, unknown>)[key];
      if (typeof v === 'number') {
        const val = Math.round(v * 100) / 100;
        rounded[key] = val;
        if (val < overallMin) overallMin = val;
        if (val > overallMax) overallMax = val;
      } else {
        // Keep null/undefined as undefined so connectNulls skips them
        rounded[key] = undefined;
      }
    }
    return rounded;
  });

  if (overallMin === Infinity) overallMin = 0;
  if (overallMax === -Infinity) overallMax = 100;

  // Ensure thresholds are visible in the Y-axis range
  if (tMin !== undefined && tMin < overallMin) overallMin = tMin;
  if (tMax !== undefined && tMax > overallMax) overallMax = tMax;

  // Add 5% padding to the Y axis domain
  const padding = (overallMax - overallMin) * 0.05 || 5;
  const domainMin = Math.floor(overallMin - padding);
  const domainMax = Math.ceil(overallMax + padding);
  const domainRange = domainMax - domainMin || 1;

  // Gradient offset percentages (top of chart = 0%, bottom = 100%)
  const topOffset =
    hasThresholds && tMax !== undefined
      ? Math.max(0, Math.min(1, (domainMax - tMax) / domainRange))
      : 0;

  const bottomOffset =
    hasThresholds && tMin !== undefined
      ? Math.max(0, Math.min(1, (domainMax - tMin) / domainRange))
      : 1;

  return (
    <PerfomaxCard
      ref={cardRef}
      title={title}
      className={cn('flex flex-col', className)}
      bodyClassName="flex-1"
      action={
        <div className="flex items-center gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            {series.map((s, i) => (
              <span
                key={s.dataKey as string}
                className="flex items-center gap-1.5"
              >
                <span
                  className="inline-block h-0.5 w-4"
                  style={{
                    backgroundColor:
                      s.color ?? LINE_COLORS[i % LINE_COLORS.length],
                  }}
                />
                {s.label}
              </span>
            ))}
          </div>
          <ChartExportButton
            targetRef={cardRef}
            fileName={title.toLowerCase().replace(/\s+/g, '-')}
          />
        </div>
      }
    >
      <div className="relative flex h-full min-h-[250px] w-full pb-2 pl-2 pt-2">
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
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 30, left: -15, bottom: 5 }}
              >
                <defs>
                  {hasThresholds &&
                    series.map((s, i) => {
                      const color =
                        s.color ?? LINE_COLORS[i % LINE_COLORS.length];
                      const vals = chartData
                        .map((d) => d[s.dataKey] as number | undefined)
                        .filter((v): v is number => v !== undefined);

                      if (vals.length === 0) return null;

                      const lineMin = Math.min(...vals);
                      const lineMax = Math.max(...vals);

                      // Include thresholds in the range calculation to ensure the gradient
                      // stretches enough to cover the transition points if the line crosses them.
                      const effectiveMin = Math.min(lineMin, tMin ?? lineMin);
                      const effectiveMax = Math.max(lineMax, tMax ?? lineMax);
                      const lineRange = effectiveMax - effectiveMin || 1;

                      // Calculate offsets relative to the line's own bounding box
                      // Recharts stretches the gradient from the line's maximum Y to its minimum Y.
                      const lineTopOffset =
                        tMax !== undefined
                          ? Math.max(
                              0,
                              Math.min(1, (effectiveMax - tMax) / lineRange)
                            )
                          : 0;

                      const lineBottomOffset =
                        tMin !== undefined
                          ? Math.max(
                              0,
                              Math.min(1, (effectiveMax - tMin) / lineRange)
                            )
                          : 1;

                      return (
                        <linearGradient
                          key={`grad-${s.dataKey}`}
                          id={`grad-${s.dataKey}`}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          {/* Top danger zone: only include if threshold is reached/crossed */}
                          {tMax !== undefined && lineMax >= tMax && (
                            <>
                              <stop offset="0%" stopColor="#EF4444" />
                              <stop
                                offset={`${lineTopOffset * 100}%`}
                                stopColor="#EF4444"
                              />
                            </>
                          )}

                          {/* Safe zone: spans from the top or top threshold to the bottom or bottom threshold */}
                          <stop
                            offset={
                              tMax !== undefined && lineMax >= tMax
                                ? `${lineTopOffset * 100}%`
                                : '0%'
                            }
                            stopColor={color}
                          />
                          <stop
                            offset={
                              tMin !== undefined && lineMin <= tMin
                                ? `${lineBottomOffset * 100}%`
                                : '100%'
                            }
                            stopColor={color}
                          />

                          {/* Bottom danger zone: only include if threshold is reached/crossed */}
                          {tMin !== undefined && lineMin <= tMin && (
                            <>
                              <stop
                                offset={`${lineBottomOffset * 100}%`}
                                stopColor="#EF4444"
                              />
                              <stop offset="100%" stopColor="#EF4444" />
                            </>
                          )}
                        </linearGradient>
                      );
                    })}
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
                  padding={{ left: 10, right: 10 }}
                />
                <YAxis
                  domain={[0, hasThresholds ? domainMax : 'auto']}
                  tick={{ fontSize: 10, fill: '#9FA6B5' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatVal}
                />
                <Tooltip
                  content={(props) => (
                    <CustomTooltip
                      {...props}
                      label={formatTooltipTimestampLabel(props.label)}
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
                {series.map((s, i) => {
                  const vals = chartData
                    .map((d) => d[s.dataKey] as number | undefined)
                    .filter((v): v is number => v !== undefined);

                  if (vals.length === 0) return null;

                  const lineMin = Math.min(...vals);
                  const lineMax = Math.max(...vals);
                  const color = s.color ?? LINE_COLORS[i % LINE_COLORS.length];

                  // Determine if the line is entirely within one zone to avoid
                  // the SVG gradient "horizontal line" bug (where the gradient
                  // colors the thickness of the line instead of its height).
                  let stroke = `url(#grad-${s.dataKey})`;

                  if (hasThresholds) {
                    const isFullySafe =
                      (tMax === undefined || lineMax < tMax) &&
                      (tMin === undefined || lineMin > tMin);
                    const isFullyAbove = tMax !== undefined && lineMin >= tMax;
                    const isFullyBelow = tMin !== undefined && lineMax <= tMin;

                    if (isFullySafe) {
                      stroke = color;
                    } else if (isFullyAbove || isFullyBelow) {
                      stroke = '#EF4444';
                    }
                  } else {
                    stroke = color;
                  }

                  return (
                    <Line
                      key={s.dataKey as string}
                      type="monotone"
                      dataKey={s.dataKey as string}
                      name={s.label}
                      stroke={stroke}
                      strokeWidth={2}
                      dot={false}
                      connectNulls
                      isAnimationActive={false}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
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
