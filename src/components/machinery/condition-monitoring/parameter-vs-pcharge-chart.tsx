'use client';

import PerfomaxCard from '@/components/cards/perfomax-card';
import { CustomTooltip } from '@/components/charts/custom-tooltip';
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

/**
 * Parameter vs Pcharge - iso
 *
 * Scatter chart showing Charge Air Pressure (x) vs Exh Gas Temp Manifold (y).
 * Two series with inline legend in the widget header.
 */
export default function ParameterVsPchargeChart({
  className,
}: {
  className?: string;
}) {
  return (
    <PerfomaxCard
      title="Parameter vs Pcharge - iso"
      className={className}
      bodyClassName="px-2 py-2"
      action={
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span
              className="inline-block h-0.5 w-4"
              style={{ backgroundColor: '#22C55E' }}
            />
            Item
          </span>
          <span className="flex items-center gap-1">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: '#A855F7' }}
            />
            Item
          </span>
        </div>
      }
    >
      <div className="flex h-full pt-2">
        {/* Y-axis label */}
        <div className="flex flex-col items-center justify-center gap-1 pr-1">
          <span
            className="text-[10px] font-medium text-muted-foreground"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            Exh Gas Temp Manifold
          </span>
        </div>

        <div className="flex flex-1 flex-col">
          <div className="aspect-[1060/900] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{ top: 5, right: 10, left: -15, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Charge Air Pressure"
                  tick={{ fontSize: 10, fill: '#9FA6B5' }}
                  domain={[0, 5]}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Exh Gas Temp Manifold"
                  tick={{ fontSize: 10, fill: '#9FA6B5' }}
                  domain={[0, 450]}
                  tickCount={10}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ strokeDasharray: '3 3' }}
                />
                <Scatter
                  name="Line"
                  data={[]}
                  fill="#22C55E"
                  line={{ stroke: '#22C55E', strokeWidth: 2 }}
                  shape="circle"
                  legendType="line"
                />
                <Scatter name="Dots" data={[]} fill="#A855F7" shape="circle" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* X-axis label */}
          <div className="mt-1 flex items-center justify-center">
            <span className="text-[10px] font-medium text-muted-foreground">
              Charge Air Pressure
            </span>
          </div>
        </div>
      </div>
    </PerfomaxCard>
  );
}
