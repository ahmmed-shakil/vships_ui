'use client';

import PerfomaxCard from '@/components/cards/perfomax-card';
import type {
  ParameterScatterPoint,
  ParameterScatterResponse,
} from '@/types/api';
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
function formatScatterValue(v: unknown): string {
  if (typeof v === 'number' && !Number.isNaN(v)) return v.toFixed(2);
  return String(v ?? '');
}

function firstNumericFromPoint(
  p: ParameterScatterPoint,
  keys: (keyof ParameterScatterPoint)[]
): number | null {
  for (const k of keys) {
    const v = p[k];
    if (typeof v === 'number' && !Number.isNaN(v)) return v;
  }
  return null;
}

/** Cyl 1 first (matches first line on sensor chart); mean sometimes missing */
const EXHAUST_CYLINDERS_Y_KEYS: (keyof ParameterScatterPoint)[] = [
  'eg_temp_1',
  'eg_temp_mean',
];

// Map parameter title to the actual field name in ParameterScatterPoint
const PARAMETER_FIELD_MAP: Record<string, keyof ParameterScatterPoint> = {
  'Turbocharger RPM': 'tc_rpm',
  'Engine RPM': 'rpm',
  'Fuel Performance Index': 'fpi',
  'Fuel Consumption': 'fuel_consumption',
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
      PARAMETER_FIELD_MAP[parameterName] ?? ('rpm' as keyof ParameterScatterPoint);

    response.data.forEach((p, i) => {
      const xVal = p.tc_rpm as number;
      const yVal =
        parameterName === 'Exhaust Gas Temperatures (Cylinders)'
          ? firstNumericFromPoint(p, EXHAUST_CYLINDERS_Y_KEYS)
          : (p[yField] as number | null);
      if (xVal == null || yVal == null) return;
      const pt = { x: xVal, y: yVal };
      if (abnormalSet.has(i)) {
        abnormalData.push(pt);
      } else {
        normalData.push(pt);
      }
    });
  }

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
            {yAxisLabel}
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
                    name={yAxisLabel}
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
