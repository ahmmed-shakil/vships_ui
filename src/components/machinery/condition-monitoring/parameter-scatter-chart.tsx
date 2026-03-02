'use client';

import PerfomaxCard from '@/components/cards/perfomax-card';
import { CustomTooltip } from '@/components/charts/custom-tooltip';
import {
  scatterDataGreen,
  scatterDataPurple,
} from '@/data/nura/condition-monitoring-chart-data';
import { useMemo, useState } from 'react';
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Select } from 'rizzui/select';

/* ------------------------------------------------------------------ */
/* Dropdown options */
/* ------------------------------------------------------------------ */

const paramOptions = [
  { label: 'Param 1', value: 'param1' },
  { label: 'Param 2', value: 'param2' },
  { label: 'Param 3', value: 'param3' },
];

/* ------------------------------------------------------------------ */
/* Component */
/* ------------------------------------------------------------------ */

export default function ParameterScatterChart({ className }: { className?: string }) {
  const [opt1, setOpt1] = useState(paramOptions[0]);
  const [opt2, setOpt2] = useState(paramOptions[1]);

  // Exclude selected param from the other dropdown
  const opt1Options = useMemo(() => paramOptions.filter((o) => o.value !== opt2.value), [opt2]);
  const opt2Options = useMemo(() => paramOptions.filter((o) => o.value !== opt1.value), [opt1]);

  return (
    <PerfomaxCard
      className={className}
      title={
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-lg font-bold">Scatter</span>
          <Select
            options={opt1Options}
            value={opt1}
            onChange={setOpt1}
            className="w-28"
            selectClassName="h-8 text-xs font-semibold"
            dropdownClassName="text-sm"
          />
          <span className="">vs</span>
          <Select
            options={opt2Options}
            value={opt2}
            onChange={setOpt2}
            className="w-28"
            selectClassName="h-8 text-xs font-semibold"
            dropdownClassName="text-sm"
          />
        </div>
      }
      action={
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-4 rounded-sm" style={{ backgroundColor: '#22C55E' }} />
            Item
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rotate-45 rounded-sm" style={{ backgroundColor: '#A855F7' }} />
            Item
          </span>
        </div>
      }
      bodyClassName="px-3 pb-4"
    >
      {/* Chart with axis labels */}
      <div className="flex mt-2 h-full">
        {/* Y-axis label */}
        <div className="flex flex-col items-center justify-center gap-1 pr-1">
          <span
            className="text-[10px] text-muted-foreground font-medium"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            Charge Air Pressure
          </span>
        </div>

        {/* Chart + X-axis */}
        <div className="flex-1 flex flex-col">
          <div className="aspect-[6/5]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 5, right: 20, left: -30, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Fuel Pump Index"
                  tick={{ fontSize: 11 }}
                  domain={[0, 100]}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Charge Air Pressure"
                  tick={{ fontSize: 11 }}
                  domain={[0, 5]}
                  tickCount={11}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ strokeDasharray: '3 3' }}
                />
                <Scatter
                  name="Series 1"
                  data={scatterDataGreen}
                  fill="#22C55E"
                  shape="circle"
                />
                <Scatter
                  name="Series 2"
                  data={scatterDataPurple}
                  fill="#A855F7"
                  shape="diamond"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* X-axis label */}
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="text-[10px] text-muted-foreground font-medium">
              Fuel Pump Index
            </span>
          </div>
        </div>
      </div>
    </PerfomaxCard>
  );
}
