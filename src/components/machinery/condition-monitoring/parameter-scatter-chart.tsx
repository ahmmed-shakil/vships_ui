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
/*  Dropdown options                                                    */
/* ------------------------------------------------------------------ */

const paramOptions = [
  { label: 'Param 1', value: 'param1' },
  { label: 'Param 2', value: 'param2' },
  { label: 'Param 3', value: 'param3' },
];

/** Narrow numeric selectors — these sit beside the axis labels */
const xValueOptions = [
  { label: '0–90', value: '0-90' },
  { label: '0–50', value: '0-50' },
  { label: '10–80', value: '10-80' },
  { label: '20–90', value: '20-90' },
];

const yValueOptions = [
  { label: '0–5', value: '0-5' },
  { label: '0–3', value: '0-3' },
  { label: '1–4', value: '1-4' },
  { label: '2–5', value: '2-5' },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ParameterScatterChart({ className }: { className?: string }) {
  const [opt1, setOpt1] = useState(paramOptions[0]);
  const [opt2, setOpt2] = useState(paramOptions[1]);
  const [xVal, setXVal] = useState(xValueOptions[0]);
  const [yVal, setYVal] = useState(yValueOptions[0]);

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
      {/* Chart with axis labels + narrow numeric dropdowns */}
      <div className="flex mt-2 h-full">
        {/* Y-axis: static label + narrow dropdown */}
        <div className="flex flex-col items-center justify-center gap-1 pr-1">
          <span
            className="text-[10px] text-muted-foreground font-medium"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            Charge Air Pressure
          </span>
          <Select
            options={yValueOptions}
            value={yVal}
            onChange={setYVal}
            className="[&_button]:!px-1"
            selectClassName="h-5 text-[9px] font-medium"
            dropdownClassName="text-xs min-w-[80px]"
          />
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

          {/* X-axis: static label + narrow dropdown */}
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="text-[10px] text-muted-foreground font-medium">
              Fuel Pump Index
            </span>
            <Select
              options={xValueOptions}
              value={xVal}
              onChange={setXVal}
              className="w-16 [&_button]:!px-1"
              selectClassName="h-5 text-[9px] font-medium"
              dropdownClassName="text-xs min-w-[80px]"
            />
          </div>
        </div>
      </div>
    </PerfomaxCard>
  );
}
