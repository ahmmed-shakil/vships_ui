'use client';

import PerfomaxCard from '@/components/cards/perfomax-card';
import ChartDownloadButtons from '@/components/charts/chart-download-buttons';
import type {
  ParameterScatterPoint,
  ParameterScatterResponse,
} from '@/types/api';
import { useMemo, useRef } from 'react';
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
 * Parameter vs RPM
 *
 * Scatter chart showing a parameter (y) vs TC RPM (x).
 * Two series with inline legend in the widget header.
 */
/** Axis ticks + tooltip: one decimal place (e.g. 2.345 → 2.3) */
function formatScatterValue(v: unknown): string {
  if (typeof v === 'number' && !Number.isNaN(v)) return v.toFixed(1);
  return String(v ?? '');
}

// Map sensor row title → single Y-axis field
const PARAMETER_FIELD_MAP: Record<string, keyof ParameterScatterPoint> = {
  'Turbocharger RPM': 'tc_rpm',
  'Engine RPM': 'rpm',
  'Fuel Performance Index': 'fpi',
  'Fuel Consumption': 'fuel_consumption',
  'Exhaust Gas Temperatures (Cylinders)': 'eg_temp_1',
  'Exhaust Gas Temp (Turbo Out / Manifold)': 'eg_temp_out_turbo',
  'Charge Air Pressure': 'chargeair_press',
  'HT Cooling Water Temperature': 'ht_cw_inlet_temp',
  'Lube Oil Temperature': 'lo_temp',
  'Lube Oil Pressure': 'lo_press',
  'Engine Load': 'load_kw',
};

export default function ParameterVsRpmChart({
  className,
  parameterName,
  yAxisLabel,
  response,
  isLoading,
}: {
  className?: string;
  parameterName: string;
  yAxisLabel: string;
  response?: ParameterScatterResponse | null;
  isLoading?: boolean;
}) {
  const normalData: { x: number; y: number }[] = [];
  const abnormalData: { x: number; y: number }[] = [];

  if (response?.data?.length) {
    const normalSet = new Set(response.operating_modes?.normal ?? []);
    const abnormalSet = new Set(response.operating_modes?.abnormal ?? []);
    const yField =
      PARAMETER_FIELD_MAP[parameterName] ??
      ('rpm' as keyof ParameterScatterPoint);

    response.data.forEach((p, i) => {
      const xVal = p.tc_rpm as number;
      const yVal = p[yField] as number | null;
      if (xVal == null || yVal == null) return;
      const pt = { x: xVal, y: yVal };
      if (abnormalSet.has(i)) {
        abnormalData.push(pt);
      } else {
        normalData.push(pt);
      }
    });
  }

  const chartRef = useRef<HTMLDivElement>(null);

  // CSV data: combine normal + abnormal with a 'mode' column
  const csvData = useMemo(() => {
    const rows: Record<string, unknown>[] = [];
    normalData.forEach((p) => rows.push({ tc_rpm: p.x, [parameterName]: p.y, mode: 'Normal' }));
    abnormalData.forEach((p) => rows.push({ tc_rpm: p.x, [parameterName]: p.y, mode: 'Abnormal' }));
    return rows;
  }, [normalData, abnormalData, parameterName]);

  const csvColumns = useMemo(
    () => [
      { key: 'tc_rpm', label: 'TC RPM' },
      { key: parameterName, label: parameterName },
      { key: 'mode', label: 'Mode' },
    ],
    [parameterName]
  );

  return (
    <PerfomaxCard
      title="Scatter"
      headerFooter="Parameter vs RPM"
      headerFooterClassName="px-4"
      className={className}
      bodyClassName="px-2 py-2"
      action={
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span
              className="inline-block h-0.5 w-4"
              style={{ backgroundColor: '#22C55E' }}
            />
            Baseline
          </span>
          <span className="flex items-center gap-1">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: '#A855F7' }}
            />
            Trendline
          </span>
          <ChartDownloadButtons
            chartRef={chartRef}
            data={csvData}
            fileName={`parameter-vs-rpm-${parameterName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
            csvColumns={csvColumns}
          />
        </div>
      }
    >
      <div ref={chartRef} className="flex h-full pt-2">
        {/* Y-axis label */}
        <div className="flex max-w-[4.5rem] flex-col items-center justify-center gap-1 pr-1">
          <span
            className="text-center text-[10px] font-medium leading-tight text-muted-foreground"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            {parameterName}
          </span>
        </div>

        <div className="flex min-h-[250px] flex-1 flex-col">
          <div className="h-[250px] w-full shrink-0">
            {isLoading ? (
              <div className="flex h-full min-h-[250px] items-center justify-center">
                <span className="animate-pulse text-sm text-muted-foreground">
                  Loading…
                </span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%" className="">
                <ScatterChart
                  margin={{ top: 5, right: 10, left: -15, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    dataKey="x"
                    name="TC RPM"
                    tick={{ fontSize: 10, fill: '#9FA6B5' }}
                    tickFormatter={formatScatterValue}
                    domain={[0, 'auto']}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name={parameterName}
                    tick={{ fontSize: 10, fill: '#9FA6B5' }}
                    tickFormatter={formatScatterValue}
                    domain={[0, 'auto']}
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
                              <span className="font-medium">
                                {formatScatterValue(item.value)}
                              </span>
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
                    shape="circle"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* X-axis label */}
          <div className="mt-1 flex items-center justify-center">
            <span className="text-[10px] font-medium text-muted-foreground">
              TC RPM
            </span>
          </div>
        </div>
      </div>
    </PerfomaxCard>
  );
}
