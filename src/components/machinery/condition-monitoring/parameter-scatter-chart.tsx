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
  { label: 'Fuel Consumption', value: 'fuelConsumption' },
  { label: 'Engine RPM', value: 'engineRpm' },
  { label: 'Engine Load', value: 'engineLoad' },
  { label: 'Exhaust Temp', value: 'exhaustTemp' },
  { label: 'Lube Oil Pressure', value: 'lubeOilPressure' },
  { label: 'Coolant Temp', value: 'coolantTemp' },
  { label: 'Charge Air Pressure', value: 'chargeAirPressure' },
];

/* ------------------------------------------------------------------ */
/* Component */
/* ------------------------------------------------------------------ */

export default function ParameterScatterChart({
  className,
}: {
  className?: string;
}) {
  const [opt1, setOpt1] = useState(paramOptions[0]);
  const [opt2, setOpt2] = useState(paramOptions[1]);

  // Exclude selected param from the other dropdown
  const opt1Options = useMemo(
    () => paramOptions.filter((o) => o.value !== opt2.value),
    [opt2]
  );
  const opt2Options = useMemo(
    () => paramOptions.filter((o) => o.value !== opt1.value),
    [opt1]
  );

  return (
    <PerfomaxCard
      className={className}
      title={
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold">Scatter</span>
          <Select
            options={opt1Options}
            value={opt1}
            onChange={setOpt1}
            className="w-24 min-w-0 shrink"
            selectClassName="h-8 text-xs font-semibold"
            dropdownClassName="text-sm"
          />
          <span className="">vs</span>
          <Select
            options={opt2Options}
            value={opt2}
            onChange={setOpt2}
            className="w-24 min-w-0 shrink"
            selectClassName="h-8 text-xs font-semibold"
            dropdownClassName="text-sm"
          />
        </div>
      }
      action={
        <div className="flex items-center gap-3 pt-2 text-xs">
          <span className="flex items-center gap-1">
            <span
              className="inline-block h-2 w-4 rounded-sm"
              style={{ backgroundColor: '#22C55E' }}
            />
            Fuel Cons
          </span>
          <span className="flex items-center gap-1">
            <span
              className="inline-block h-2 w-2 rotate-45 rounded-sm"
              style={{ backgroundColor: '#A855F7' }}
            />
            Engine RPM
          </span>
        </div>
      }
      bodyClassName="px-3 pb-4 mt-4"
    >
      {/* Chart with axis labels */}
      <div className="mt-4 flex h-full">
        {/* Y-axis label */}
        <div className="flex flex-col items-center justify-center gap-1 pr-1">
          <span
            className="text-[10px] font-medium text-muted-foreground"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            Charge Air Pressure
          </span>
        </div>

        {/* Chart + X-axis */}
        <div className="mt-4 flex flex-1 flex-col">
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{ top: 5, right: 20, left: -30, bottom: 5 }}
              >
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
          <div className="mt-1 flex items-center justify-center gap-2">
            <span className="text-[10px] font-medium text-muted-foreground">
              Fuel Pump Index
            </span>
          </div>
        </div>
      </div>
    </PerfomaxCard>
  );
}
