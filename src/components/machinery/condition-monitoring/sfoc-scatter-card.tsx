'use client';

import HealthScoreHeader from '@/components/cards/health-score-header';
import PerfomaxCard from '@/components/cards/perfomax-card';
import { sfocScatterSeries } from '@/data/nura/sfoc-scatter-data';
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

/* ------------------------------------------------------------------ */
/* Helper: convert x (minutes) to a HH:MM timestamp string            */
/* Base time is 00:00 — so 60 min → 01:00, 120 min → 02:00, etc.     */
/* ------------------------------------------------------------------ */

function minutesToTimestamp(minutes: number): string {
  const negative = minutes < 0;
  const totalMin = Math.abs(Math.round(minutes));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  return negative ? `-${time}` : time;
}

/* ------------------------------------------------------------------ */
/* Custom tooltip – shows mode name, time & SFOC on hover             */
/* ------------------------------------------------------------------ */

function SfocTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  const point = p.payload; // { x, y }

  // Find the series that contains this exact data point
  const series = sfocScatterSeries.find((s) =>
    s.data.some((d) => d.x === point?.x && d.y === point?.y)
  );
  const color = series?.color ?? '#fff';

  return (
    <div className="rounded-md border border-gray-300 bg-gray-0 px-3 py-2 text-xs shadow-2xl dark:bg-gray-100">
      <p className="mb-1 font-semibold" style={{ color }}>
        {series?.mode ?? 'Unknown'}
      </p>
      <p>Time: {minutesToTimestamp(point?.x ?? 0)}</p>
      <p>SFOC: {point?.y} g/kWh</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* SFOC Scatter Card – first row of condition-monitoring page          */
/* ------------------------------------------------------------------ */

export default function SfocScatterCard({ className }: { className?: string }) {
  return (
    <PerfomaxCard
      className={className}
      title="SFOC Scatter"
      //   action={
      //     <div className="flex flex-col items-end gap-2">
      //       <div className="invisible">
      //         <HealthScoreHeader score={80} />
      //       </div>
      //     </div>
      //   }
      //   headerFooter={
      //     <div className="px-5 pb-1 text-sm font-medium">
      //       <span className="invisible">Placeholder</span>
      //     </div>
      //   }
      bodyClassName="px-2 border-t border-muted/50"
    >
      <div className="mt-2 flex h-full">
        {/* Y-axis label */}
        <div className="flex flex-col items-center justify-center gap-1 pr-1">
          <span
            className="text-[10px] font-medium text-muted-foreground"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            SFOC (g/kWh)
          </span>
        </div>

        {/* Chart + X-axis */}
        <div className="flex flex-1 flex-col">
          <div className="aspect-[1060/520] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{ top: 5, right: 10, left: -15, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Time"
                  tick={{ fontSize: 9 }}
                  domain={['dataMin', 'dataMax']}
                  tickFormatter={minutesToTimestamp}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="SFOC (g/kWh)"
                  tick={{ fontSize: 9 }}
                  domain={[185, 265]}
                />

                <Tooltip
                  content={<SfocTooltip />}
                  cursor={{ strokeDasharray: '3 3' }}
                />

                {sfocScatterSeries.map((s) => (
                  <Scatter
                    key={s.mode}
                    name={s.mode}
                    data={s.data}
                    fill={s.color}
                    shape={s.shape}
                    opacity={0.7}
                  />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* X-axis label */}
          <div className="mt-1 flex items-center justify-center">
            <span className="text-[10px] font-medium text-muted-foreground">
              Time
            </span>
          </div>
        </div>
      </div>
    </PerfomaxCard>
  );
}
