'use client';

import PerfomaxCard from '@/components/cards/perfomax-card';
import { CustomTooltip } from '@/components/charts/custom-tooltip';
import type { ParameterScatterResponse } from '@/types/api';
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
  response,
  isLoading,
}: {
  className?: string;
  response: ParameterScatterResponse | null;
  isLoading: boolean;
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

  // Derive scatter data from API — split by operating_modes
  const { normalData, abnormalData } = useMemo(() => {
    if (!response?.data?.length) return { normalData: [], abnormalData: [] };
    const normalSet = new Set(response.operating_modes?.normal ?? []);
    const abnormalSet = new Set(response.operating_modes?.abnormal ?? []);

    const normalPts: { x: number; y: number }[] = [];
    const abnormalPts: { x: number; y: number }[] = [];

    response.data.forEach((p, i) => {
      const xVal = (p as any)[opt1.value] as number;
      const yVal = (p as any)[opt2.value] as number;
      if (xVal == null || yVal == null) return;
      const pt = { x: xVal, y: yVal };
      if (abnormalSet.has(i)) {
        abnormalPts.push(pt);
      } else {
        normalPts.push(pt);
      }
    });

    return { normalData: normalPts, abnormalData: abnormalPts };
  }, [response, opt1.value, opt2.value]);

  return (
    <PerfomaxCard
      className={className}
      title="Scatter"
      // titleClassName="text-lg font-bold"
      action={
        <div className="flex items-center gap-8 whitespace-nowrap pt-1 text-xs">
          <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
            <span
              className="inline-block h-2.5 w-4 rounded-sm"
              style={{ backgroundColor: '#22C55E' }}
            />
            <span className="text-foreground">{opt1.label}</span>
          </span>
          <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
            <span
              className="inline-block h-2.5 w-2.5 rotate-45 rounded-sm"
              style={{ backgroundColor: '#A855F7' }}
            />
            <span className="text-foreground">{opt2.label}</span>
          </span>
        </div>
      }
      headerFooter={
        <div className="flex items-center gap-2 px-3 pb-3 pt-1">
          <Select
            options={opt1Options}
            value={opt1}
            onChange={setOpt1}
            className="w-44 min-w-0 shrink"
            selectClassName="h-9 text-xs font-semibold"
            dropdownClassName="text-sm"
          />
          <span className="text-sm font-bold text-muted-foreground">vs</span>
          <Select
            options={opt2Options}
            value={opt2}
            onChange={setOpt2}
            className="w-44 min-w-0 shrink"
            selectClassName="h-9 text-xs font-semibold"
            dropdownClassName="text-sm"
          />
        </div>
      }
      bodyClassName="px-3 pb-4"
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
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <span className="animate-pulse text-sm text-muted-foreground">
                  Loading…
                </span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                  margin={{ top: 5, right: 20, left: -30, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    dataKey="x"
                    name={opt1.label}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name={opt2.label}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ strokeDasharray: '3 3' }}
                  />
                  <Scatter
                    name="Normal"
                    data={normalData}
                    fill="#22C55E"
                    shape="circle"
                  />
                  <Scatter
                    name="Abnormal"
                    data={abnormalData}
                    fill="#A855F7"
                    shape="diamond"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            )}
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
