'use client';

import PerfomaxCard from '@/components/cards/perfomax-card';
import { CustomTooltip } from '@/components/charts/custom-tooltip';

import cn from '@/utils/class-names';
import {
  CartesianGrid,
  Line,
  LineChart,
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
}

export default function SensorLineChart({
  title,
  yAxisLabel,
  series,
  data,
  isLoading,
  className,
}: SensorLineChartProps) {
  const formatVal = (v: number) => v.toFixed(2);

  // Round numeric values to 2 decimal places and convert nulls to 0
  const dataKeys = series.map((s) => s.dataKey);
  const chartData = data.map((point) => {
    const rounded: Record<string, unknown> = { ...point };
    for (const key of dataKeys) {
      const v = (point as Record<string, unknown>)[key];
      if (typeof v === 'number') {
        rounded[key] = Math.round(v * 100) / 100;
      } else if (v === null || v === undefined) {
        rounded[key] = 0;
      }
    }
    return rounded;
  });

  return (
    <PerfomaxCard
      title={title}
      className={cn('flex flex-col', className)}
      bodyClassName="flex-1"
      action={
        <div className="flex flex-wrap items-center gap-4 text-xs">
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
                  tick={{ fontSize: 10, fill: '#9FA6B5' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatVal}
                />
                <Tooltip content={<CustomTooltip />} />
                {series.map((s, i) => (
                  <Line
                    key={s.dataKey as string}
                    type="monotone"
                    dataKey={s.dataKey as string}
                    name={s.label}
                    stroke={s.color ?? LINE_COLORS[i % LINE_COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                    isAnimationActive={false}
                  />
                ))}
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
