'use client';

import PerfomaxCard from '@/components/cards/perfomax-card';
import ChartDownloadButtons from '@/components/charts/chart-download-buttons';
import type { ParameterScatterResponse } from '@/types/api';
import { useMemo, useRef, useState } from 'react';
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
/* Dropdown options & API field mapping */
/* ------------------------------------------------------------------ */

const paramOptions = [
  { label: 'RPM', value: 'rpm' },
  { label: 'TC RPM', value: 'tc_rpm' },
  { label: 'FPI', value: 'fpi' },
  { label: 'EG Temp 1', value: 'eg_temp_1' },
  { label: 'EG Temp 2', value: 'eg_temp_2' },
  { label: 'EG Temp 3', value: 'eg_temp_3' },
  { label: 'EG Temp 4', value: 'eg_temp_4' },
  { label: 'EG Temp 5', value: 'eg_temp_5' },
  { label: 'EG Temp 6', value: 'eg_temp_6' },
  { label: 'EG Temp 7', value: 'eg_temp_7' },
  { label: 'EG Temp 8', value: 'eg_temp_8' },
  { label: 'EG Temp 9', value: 'eg_temp_9' },
  { label: 'EG Temp Mean', value: 'eg_temp_mean' },
  { label: 'Max EG Temp Mean', value: 'max_eg_temp_mean' },
  { label: 'EG Temp Compensator', value: 'eg_temp_compensator' },
  { label: 'EG Temp Out Turbo', value: 'eg_temp_out_turbo' },
  { label: 'EG Temp TC In', value: 'eg_temp_tc_in' },
  { label: 'EG Temp TC Out', value: 'eg_temp_tc_out' },
  { label: 'EG Temp Dev 1', value: 'eg_temp_dev_1' },
  { label: 'EG Temp Dev 2', value: 'eg_temp_dev_2' },
  { label: 'EG Temp Dev 3', value: 'eg_temp_dev_3' },
  { label: 'EG Temp Dev 4', value: 'eg_temp_dev_4' },
  { label: 'EG Temp Dev 5', value: 'eg_temp_dev_5' },
  { label: 'EG Temp Dev 6', value: 'eg_temp_dev_6' },
  { label: 'EG Temp Dev 7', value: 'eg_temp_dev_7' },
  { label: 'EG Temp Dev 8', value: 'eg_temp_dev_8' },
  { label: 'Exhaust Gas Limit', value: 'exh_gas_limit' },
  { label: 'Exhaust Gas Temp', value: 'exh_gas_temp' },
  { label: 'Exhaust Gas Temp Diff', value: 'exhaust_gas_temp_diff' },
  { label: 'FO Press Inlet', value: 'fo_press_inlet' },
  { label: 'FO Press Filter In', value: 'fo_press_filter_in' },
  { label: 'FO Temp In', value: 'fo_temp_in' },
  { label: 'FO Flow Inlet', value: 'fo_flow_inlet' },
  { label: 'FO Flow Outlet', value: 'fo_flow_outlet' },
  { label: 'LO Press', value: 'lo_press' },
  { label: 'LO Press In', value: 'lo_press_in' },
  { label: 'LO Press Filter In', value: 'lo_press_filter_in' },
  { label: 'LO Press TC', value: 'lo_press_tc' },
  { label: 'LO Temp', value: 'lo_temp' },
  { label: 'LO Temp In', value: 'lo_temp_in' },
  { label: 'LO TC Temp', value: 'lo_tc_temp' },
  { label: 'HT CW Press', value: 'ht_cw_press' },
  { label: 'HT CW Temp', value: 'ht_cw_temp' },
  { label: 'HT CW Inlet Temp', value: 'ht_cw_inlet_temp' },
  { label: 'HT CW Temp Out', value: 'ht_cw_temp_out' },
  { label: 'LT CW Press', value: 'lt_cw_press' },
  { label: 'LT CW Temp', value: 'lt_cw_temp' },
  { label: 'LT CW Temp In', value: 'lt_cw_temp_in' },
  { label: 'Start Air Press', value: 'startair_press' },
  { label: 'Start Air Temp Out', value: 'startair_temp_out' },
  { label: 'Charge Air Press', value: 'chargeair_press' },
  { label: 'Charge Air Temp', value: 'chargeair_temp' },
  { label: 'Charge Air Press AC Out', value: 'chargeair_press_ac_out' },
  { label: 'Charge Air Temp AC Out', value: 'chargeair_temp_ac_out' },
  { label: 'Air Temp', value: 'air_temp' },
  { label: 'RH', value: 'rh' },
  { label: 'Gen Voltage', value: 'gen_voltage' },
  { label: 'Gen Freq', value: 'gen_freq' },
  { label: 'Bus Voltage', value: 'bus_voltage' },
  { label: 'Bus Freq', value: 'bus_freq' },
  { label: 'Phase Diff', value: 'phase_diff' },
  { label: 'Cos Phi', value: 'cos_phi' },
  { label: 'Engine Load (kW)', value: 'load_kw' },
  { label: 'kVA', value: 'kva' },
  { label: 'kVAR', value: 'kvar' },
  { label: 'Current U', value: 'i_u' },
  { label: 'Current V', value: 'i_v' },
  { label: 'Current W', value: 'i_w' },
  { label: 'Voltage UV', value: 'v_uv' },
  { label: 'Voltage VW', value: 'v_vw' },
  { label: 'Voltage UW', value: 'v_uw' },
  { label: 'Winding U Temp Diff', value: 'wind_u_temp_diff' },
  { label: 'Winding V Temp Diff', value: 'wind_v_temp_diff' },
  { label: 'Winding W Temp Diff', value: 'wind_w_temp_diff' },
  { label: 'FO Srv Tk17 PS', value: 'fo_srv_tk17_ps' },
  { label: 'FO Srv Tk17 SB', value: 'fo_srv_tk17_sb' },
  { label: 'FO Tk3 PS', value: 'fo_tk3_ps' },
  { label: 'FO Tk3 SB', value: 'fo_tk3_sb' },
  { label: 'FO Tk5 PS', value: 'fo_tk5_ps' },
  { label: 'FO Tk5 SB', value: 'fo_tk5_sb' },
  { label: 'FO Tk6 PS', value: 'fo_tk6_ps' },
  { label: 'FO Tk6 SB', value: 'fo_tk6_sb' },
  { label: 'FO Tk7 PS', value: 'fo_tk7_ps' },
  { label: 'FO Tk7 SB', value: 'fo_tk7_sb' },
  { label: 'FO Tk8 PS', value: 'fo_tk8_ps' },
  { label: 'FO Tk8 SB', value: 'fo_tk8_sb' },
  { label: 'PW Flow', value: 'pw_flow' },
  { label: 'Cargo FO Flow', value: 'cargo_fo_flow' },
  { label: 'Thrust Current', value: 'thrust_current' },
  { label: 'Thrust Servo Press', value: 'thrust_servo_press' },
  { label: 'CPP Servo Press', value: 'cpp_servo_press' },
  { label: 'Gearbox Servo Temp', value: 'gearbox_servo_temp' },
  { label: 'Gearbox Servo Press', value: 'gearbox_servo_press' },
  { label: 'Drive Bearing Temp', value: 'd_bear_temp' },
  { label: 'Non-Drive Bearing Temp', value: 'n_bear_temp' },
  { label: 'Nu', value: 'nu' },
  { label: 'Standby Sequence', value: 'standby_sequence' },
  { label: 'Fuel Consumption', value: 'fuel_consumption' },
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
  const [opt1, setOpt1] = useState(
    () =>
      paramOptions.find((o) => o.value === 'eg_temp_1') ??
      paramOptions.find((o) => o.value === 'rpm') ??
      paramOptions[0]
  );
  const [opt2, setOpt2] = useState(
    () =>
      paramOptions.find((o) => o.value === 'eg_temp_2') ??
      paramOptions.find((o) => o.value === 'load_kw') ??
      paramOptions[1]
  );

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

  const chartRef = useRef<HTMLDivElement>(null);

  // CSV data: combine normal + abnormal with a 'mode' column
  const csvData = useMemo(() => {
    const rows: Record<string, unknown>[] = [];
    normalData.forEach((p) => rows.push({ x: p.x, y: p.y, mode: 'Baseline' }));
    abnormalData.forEach((p) => rows.push({ x: p.x, y: p.y, mode: 'Trendline' }));
    return rows;
  }, [normalData, abnormalData]);

  const csvColumns = useMemo(
    () => [
      { key: 'x', label: opt1?.label ?? 'Parameter X' },
      { key: 'y', label: opt2?.label ?? 'Parameter Y' },
      { key: 'mode', label: 'Mode' },
    ],
    [opt1, opt2]
  );

  return (
    <PerfomaxCard
      ref={chartRef}
      className={className}
      title="Scatter"
      // titleClassName="text-lg font-bold"
      action={
        <div className="flex items-center gap-8 whitespace-nowrap pt-1 text-xs">
          {/* Dynamic legend labels (kept for easy rollback if needed)
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
          */}
          <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
            <span
              className="inline-block h-2.5 w-4 rounded-sm"
              style={{ backgroundColor: '#22C55E' }}
            />
            <span className="text-foreground">Static</span>
          </span>
          <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
            <span
              className="inline-block h-2.5 w-2.5 rotate-45 rounded-sm"
              style={{ backgroundColor: '#A855F7' }}
            />
            <span className="text-foreground">Ref</span>
          </span>
          <ChartDownloadButtons
            chartRef={chartRef}
            data={csvData}
            fileName="parameter-scatter"
            csvColumns={csvColumns}
          />
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
            {opt2.label}
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
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="border-border rounded-md border bg-background px-3 py-2 text-xs shadow-md">
                          {payload.map((item: any, i: number) => (
                            <div
                              key={i}
                              className="flex items-center gap-1.5 py-0.5"
                            >
                              <span
                                className="inline-block h-2 w-2 flex-shrink-0 rounded-full"
                                style={{ backgroundColor: item.fill }}
                              />
                              <span className="text-muted-foreground">
                                {item.name}:
                              </span>
                              <span className="font-medium">{item.value}</span>
                            </div>
                          ))}
                        </div>
                      );
                    }}
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
              {opt1.label}
            </span>
          </div>
        </div>
      </div>
    </PerfomaxCard>
  );
}
