'use client';

import PerfomaxCard from '@/components/cards/perfomax-card';
import { CustomTooltip } from '@/components/charts/custom-tooltip';
import {
  trendlineData,
  trendlineSeries,
} from '@/data/nura/condition-monitoring-chart-data';
import { useCallback, useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

/** Custom X-axis tick that renders date on top line, time on bottom line */
function DateTimeTick({ x, y, payload }: any) {
  const parts = (payload.value as string).split('\n');
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={10} textAnchor="middle" fontSize={8} fill="#9FA6B5">
        {parts[0]}
      </text>
      <text x={0} y={0} dy={20} textAnchor="middle" fontSize={8} fill="#9FA6B5">
        {parts[1] ?? ''}
      </text>
    </g>
  );
}

/**
 * Delta Deviation Trendline — multi-series line chart with interactive legend.
 *
 * 7 parameters matching the reference screenshot. Clicking a legend item
 * toggles that series' visibility. Orange overlay band for the 10-20 range.
 */
export default function DeltaDeviationTrendline({
  className,
}: {
  className?: string;
}) {
  // Track which series are hidden (all visible by default)
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());

  const handleLegendClick = useCallback((dataKey: string) => {
    setHiddenSeries((prev) => {
      const next = new Set(prev);
      if (next.has(dataKey)) {
        next.delete(dataKey);
      } else {
        next.add(dataKey);
      }
      return next;
    });
  }, []);

  return (
    <PerfomaxCard
      title="Delta Deviation Trendline"
      className={className}
      bodyClassName="p-5"
    >
      <div className="flex h-full">
        {/* Y-axis label */}
        <div className="flex flex-col items-center justify-center gap-1 pr-1">
          <span
            className="text-[10px] font-medium text-muted-foreground"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            Parameter
          </span>
        </div>

        <div className="flex flex-1 flex-col">
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trendlineData}
                margin={{ top: 5, right: 20, left: -10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />

                {/* Orange overlay band for parameter range 10–20 */}
                <ReferenceArea
                  y1={12}
                  y2={24}
                  fill="#F97316"
                  fillOpacity={0.15}
                  ifOverflow="hidden"
                />

                <XAxis
                  dataKey="date"
                  tick={<DateTimeTick />}
                  interval={0}
                  height={40}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#9FA6B5' }}
                  tickCount={11}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="top"
                  onClick={(e: any) => handleLegendClick(e.dataKey)}
                  wrapperStyle={{
                    cursor: 'pointer',
                    fontSize: 11,
                    color: '#9FA6B5',
                    paddingBottom: 8,
                  }}
                />

                {trendlineSeries.map((s) => (
                  <Line
                    key={s.key}
                    type="monotone"
                    dataKey={s.key}
                    name={s.label}
                    stroke={s.color}
                    strokeWidth={2}
                    strokeDasharray={s.dash || undefined}
                    dot={false}
                    hide={hiddenSeries.has(s.key)}
                    activeDot={{ r: 4 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* X-axis label */}
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
