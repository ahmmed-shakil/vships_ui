'use client';

import PerfomaxCard from '@/components/cards/perfomax-card';
import ChartDownloadButtons from '@/components/charts/chart-download-buttons';
import { useParameters } from '@/hooks/use-machinery-data';
import type { ParameterScatterResponse } from '@/types/api';
import { useEffect, useMemo, useRef, useState } from 'react';
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
/* Dropdown options from Parameters API */
/* ------------------------------------------------------------------ */

type ParamOption = { label: string; value: string };

function toLabel(param: {
  description?: string;
  standard_id: string;
  source_name: string;
  unit?: string;
}): string {
  const base =
    param.description?.trim() || param.standard_id || param.source_name;
  return param.unit ? `${base} (${param.unit})` : base;
}

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
  const { parameters, isLoading: isParametersLoading } = useParameters();
  const [opt1, setOpt1] = useState<ParamOption | null>(null);
  const [opt2, setOpt2] = useState<ParamOption | null>(null);

  const paramOptions = useMemo<ParamOption[]>(() => {
    const map = new Map<string, ParamOption>();
    parameters.forEach((param) => {
      if (!param.standard_id) return;
      map.set(param.standard_id, {
        value: param.standard_id,
        label: toLabel(param),
      });
    });
    return Array.from(map.values()).sort((a, b) =>
      a.label.localeCompare(b.label)
    );
  }, [parameters]);

  useEffect(() => {
    if (!paramOptions.length) {
      setOpt1(null);
      return;
    }
    setOpt1((prev) => {
      if (prev) {
        const same = paramOptions.find((o) => o.value === prev.value);
        if (same) return same;
      }
      return (
        paramOptions.find((o) => o.value === 'eg_temp_1') ??
        paramOptions.find((o) => o.value === 'rpm') ??
        paramOptions[0]
      );
    });
  }, [paramOptions]);

  useEffect(() => {
    if (!paramOptions.length || !opt1) {
      setOpt2(null);
      return;
    }
    const candidates = paramOptions.filter((o) => o.value !== opt1.value);
    setOpt2((prev) => {
      if (!candidates.length) return null;
      if (prev) {
        const same = candidates.find((o) => o.value === prev.value);
        if (same) return same;
      }
      return (
        candidates.find((o) => o.value === 'eg_temp_2') ??
        candidates.find((o) => o.value === 'load_kw') ??
        candidates[0]
      );
    });
  }, [paramOptions, opt1]);

  // Exclude selected param from the other dropdown
  const opt1Options = useMemo(
    () => paramOptions.filter((o) => o.value !== opt2?.value),
    [paramOptions, opt2]
  );
  const opt2Options = useMemo(
    () => paramOptions.filter((o) => o.value !== opt1?.value),
    [paramOptions, opt1]
  );

  // Derive scatter data from API — split by operating_modes
  const { normalData, abnormalData } = useMemo(() => {
    if (!response?.data?.length || !opt1 || !opt2) {
      return { normalData: [], abnormalData: [] };
    }
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
  }, [response, opt1?.value, opt2?.value]);

  const chartRef = useRef<HTMLDivElement>(null);

  const isChartLoading = isLoading || isParametersLoading;

  // CSV data: combine normal + abnormal with a 'mode' column
  const csvData = useMemo(() => {
    const rows: Record<string, unknown>[] = [];
    normalData.forEach((p) => rows.push({ x: p.x, y: p.y, mode: 'Baseline' }));
    abnormalData.forEach((p) =>
      rows.push({ x: p.x, y: p.y, mode: 'Trendline' })
    );
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
            value={opt1 ?? undefined}
            onChange={(value) => setOpt1((value as ParamOption) ?? null)}
            className="w-44 min-w-0 shrink"
            selectClassName="h-9 text-xs font-semibold"
            dropdownClassName="text-sm"
            disabled={isParametersLoading || opt1Options.length === 0}
          />
          <span className="text-sm font-bold text-muted-foreground">vs</span>
          <Select
            options={opt2Options}
            value={opt2 ?? undefined}
            onChange={(value) => setOpt2((value as ParamOption) ?? null)}
            className="w-44 min-w-0 shrink"
            selectClassName="h-9 text-xs font-semibold"
            dropdownClassName="text-sm"
            disabled={isParametersLoading || opt2Options.length === 0}
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
            {opt2?.label ?? 'Parameter Y'}
          </span>
        </div>

        {/* Chart + X-axis */}
        <div className="mt-4 flex flex-1 flex-col">
          <div className="h-[350px] w-full">
            {isChartLoading ? (
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
                    name={opt1?.label ?? 'Parameter X'}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name={opt2?.label ?? 'Parameter Y'}
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
              {opt1?.label ?? 'Parameter X'}
            </span>
          </div>
        </div>
      </div>
    </PerfomaxCard>
  );
}
