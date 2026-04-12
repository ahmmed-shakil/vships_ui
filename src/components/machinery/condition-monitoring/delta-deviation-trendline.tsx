'use client';

import PerfomaxCard from '@/components/cards/perfomax-card';
import { CustomTooltip } from '@/components/charts/custom-tooltip';
import type { DeltaDeviationResponse } from '@/types/api';
import { useCallback, useMemo, useRef, useState } from 'react';
import ChartExportButton from './chart-export-button';
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

const SERIES_DEFS = [
  { key: 'charge_air_temp', label: 'Charge Air Temp', color: '#3B82F6' },
  { key: 'lube_oil_temp', label: 'Lube Oil Temp', color: '#22C55E' },
  { key: 'exh_temp', label: 'Exh Temp', color: '#F59E0B' },
  { key: 'ht_cooling_water_temp', label: 'HT Cooling Water', color: '#A855F7' },
  { key: 'fuel_oil_pressure', label: 'Fuel Oil Pressure', color: '#EC4899' },
  { key: 'lube_oil_pressure', label: 'Lube Oil Pressure', color: '#06B6D4' },
  {
    key: 'charge_air_pressure',
    label: 'Charge Air Pressure',
    color: '#F97316',
  },
];

export default function DeltaDeviationTrendline({
  className,
  response,
  isLoading,
}: {
  className?: string;
  response: DeltaDeviationResponse | null;
  isLoading: boolean;
}) {
  // Track which series are hidden (all visible by default)
  const cardRef = useRef<HTMLDivElement>(null);
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

  const chartData = useMemo(() => {
    if (!response?.data) return [];
    return response.data.map((p) => {
      const d = new Date(p.timestamp);
      const date = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}\n${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      return { date, ...p };
    });
  }, [response]);

  const band = response?.reference_band ?? { upper: 24, lower: 12 };

  // Show at most ~11 X-axis ticks regardless of data density (matches ocean pact)
  const xAxisInterval =
    chartData.length > 11 ? Math.ceil(chartData.length / 11) - 1 : 0;

  return (
    <PerfomaxCard
      ref={cardRef}
      title="Delta Deviation Trendline"
      className={className}
      bodyClassName="p-5"
      action={
        <ChartExportButton
          targetRef={cardRef}
          fileName="delta-deviation-trendline"
        />
      }
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
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <span className="animate-pulse text-sm text-muted-foreground">
                  Loading…
                </span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 20, left: -10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />

                  {/* Orange overlay band for reference range */}
                  <ReferenceArea
                    y1={band.lower}
                    y2={band.upper}
                    fill="#F97316"
                    fillOpacity={0.15}
                    ifOverflow="hidden"
                  />

                  <XAxis
                    dataKey="date"
                    tick={<DateTimeTick />}
                    interval={xAxisInterval}
                    height={40}
                  />
                  <YAxis
                    domain={[0, 'auto']}
                    tick={{ fontSize: 11, fill: '#9FA6B5' }}
                    tickCount={6}
                    allowDataOverflow
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

                  {SERIES_DEFS.map((s) => (
                    <Line
                      key={s.key}
                      type="monotone"
                      dataKey={s.key}
                      name={s.label}
                      stroke={s.color}
                      strokeWidth={2}
                      dot={false}
                      hide={hiddenSeries.has(s.key)}
                      activeDot={{ r: 4 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            )}
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
