'use client';

import WidgetCard from '@/components/cards/widget-card';
import { CustomTooltip } from '@/components/charts/custom-tooltip';
import { CustomYAxisTick } from '@/components/charts/custom-yaxis-tick';
import type { ConsumptionSpeedPoint } from '@/data/nura/operation-monitor-charts-data';
import { useMedia } from '@/hooks/use-media';
import {
  Area,
  Bar,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Badge } from 'rizzui';

const ENGINE_COLORS: Record<string, string> = {
  me1: '#5a5fd7',
  me2: '#10b981',
  me3: '#eab308',
  me4: '#f97316',
  dg1: '#5a5fd7',
  dg2: '#10b981',
  dg3: '#eab308',
  dg4: '#f97316',
  dg5: '#0ea5e9',
  dg6: '#ec4899',
};

const ENGINE_LABELS: Record<string, string> = {
  me1: 'ME PORT',
  me2: 'ME STBD',
  me3: 'ME CENTER',
  me4: 'AUX 1',
  dg1: 'DG 1',
  dg2: 'DG 2',
  dg3: 'DG 3',
  dg4: 'DG 4',
  dg5: 'DG 5',
  dg6: 'DG 6',
};

interface Props {
  data: ConsumptionSpeedPoint[];
  engineCount: number;
  className?: string;
}

export default function ConsumptionVsSpeedChart({
  data,
  engineCount,
  className,
}: Props) {
  const isMediumScreen = useMedia('(max-width: 1200px)', false);
  const isTablet = useMedia('(max-width: 800px)', false);
  
  const parsedKeys = data.length > 0 
    ? Object.keys(data[0]).filter((k) => k !== 'time' && k !== 'speed') 
    : [];

  const fallbackKeys = ['dg1', 'dg2', 'dg3', 'dg4', 'dg5', 'dg6', 'me1', 'me2', 'me3', 'me4'];

  const engineKeys = parsedKeys.length > 0
    ? parsedKeys
    : fallbackKeys.slice(0, engineCount);

  // Ensure axes render even when there's no data
  const chartData =
    data.length > 0
      ? data
      : [
          {
            time: '',
            speed: 0,
            ...Object.fromEntries(engineKeys.map((k) => [k, 0])),
          },
        ];

  return (
    <WidgetCard
      title="Consumption vs Speed"
      description={
        <>
          {engineKeys.map((key) => (
            <span key={key} className="mr-4 inline-flex items-center gap-1">
              <Badge
                renderAsDot
                style={{ backgroundColor: ENGINE_COLORS[key] }}
              />
              {ENGINE_LABELS[key]}
            </span>
          ))}
          <span className="inline-flex items-center gap-1">
            <Badge renderAsDot className="bg-[#dc3545]" />
            Speed (kts)
          </span>
        </>
      }
      descriptionClassName="text-gray-500 mt-1.5 mb-3 @lg:mb-0"
      headerClassName="flex-col @lg:flex-row"
      rounded="lg"
      className={className}
    >
      <div className="custom-scrollbar overflow-x-auto scroll-smooth">
        <div className="h-[420px] w-full pt-9 @7xl:h-[480px]">
          <ResponsiveContainer
            width="100%"
            {...(isTablet && { minWidth: '700px' })}
            height="100%"
          >
            <ComposedChart
              data={chartData}
              barSize={isMediumScreen ? 16 : 22}
              className="[&_.recharts-cartesian-axis-tick-value]:fill-gray-500 [&_.recharts-cartesian-axis.yAxis]:-translate-y-3 rtl:[&_.recharts-cartesian-axis.yAxis]:-translate-x-12"
            >
              <defs>
                <linearGradient
                  id="speedAreaGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="#dc3545"
                    className="[stop-opacity:0.15]"
                  />
                  <stop offset="95%" stopColor="#dc3545" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" axisLine={false} tickLine={false} />
              <YAxis
                yAxisId="left"
                axisLine={false}
                tickLine={false}
                tick={<CustomYAxisTick />}
                label={{
                  value: 'L/H',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 15,
                  style: { fontSize: 11, fill: '#888' },
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                axisLine={false}
                tickLine={false}
                domain={[0, 25]}
                label={{
                  value: 'kts',
                  angle: 90,
                  position: 'insideRight',
                  offset: 15,
                  style: { fontSize: 11, fill: '#888' },
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              {engineKeys.map((key, idx) => (
                <Bar
                  key={key}
                  yAxisId="left"
                  dataKey={key}
                  name={ENGINE_LABELS[key]}
                  fill={ENGINE_COLORS[key]}
                  {...(isTablet
                    ? { stackId: 'consumption' }
                    : idx === engineKeys.length - 1
                      ? {
                          radius: [4, 4, 0, 0] as [
                            number,
                            number,
                            number,
                            number,
                          ],
                        }
                      : {})}
                />
              ))}
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="speed"
                name="Speed (kts)"
                stroke="#dc3545"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#speedAreaGradient)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </WidgetCard>
  );
}
