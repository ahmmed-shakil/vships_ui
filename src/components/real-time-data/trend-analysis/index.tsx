'use client';

import AutoRefreshCountdown from '@/components/auto-refresh-countdown';
import PerfomaxCard from '@/components/cards/perfomax-card';
import SensorLineChart, {
  type SensorSeries,
} from '@/components/machinery/condition-monitoring/sensor-line-chart';
import SpeedMeter from '@/components/speed-meter/speed-meter';
import { useSensorDataApi } from '@/hooks/use-machinery-data';
import {
  refreshTriggerAtom,
  selectedShipAtom,
  selectedTimeAtom,
} from '@/store/condition-monitoring-atoms';
import type { SensorDataPoint } from '@/types/api';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const AUTO_REFRESH_INTERVAL_SECONDS = 30;

const SENSOR_CHART_ROWS: {
  title: string;
  yAxisLabel: string;
  series: SensorSeries[];
  thresholds?: { min?: number; max?: number };
}[] = [
    {
      title: 'Load (eKW) Trendline',
      yAxisLabel: 'Load (eKW)',
      series: [{ dataKey: 'load_kw', label: 'Load (eKW)' }],
      thresholds: { min: 0 },
    },
    {
      title: 'Engine RPM Trend',
      yAxisLabel: 'RPM',
      series: [{ dataKey: 'rpm', label: 'RPM' }],
      thresholds: { max: 700 },
    },
    {
      title: 'Exhaust Gas Temperatures — Cylinders + TC',
      yAxisLabel: 'EG Temp (°C)',
      series: [
        { dataKey: 'eg_temp_1', label: 'Cyl 1', color: '#3B82F6' },
        { dataKey: 'eg_temp_2', label: 'Cyl 2', color: '#EF4444' },
        { dataKey: 'eg_temp_3', label: 'Cyl 3', color: '#22C55E' },
        { dataKey: 'eg_temp_4', label: 'Cyl 4', color: '#F59E0B' },
        { dataKey: 'eg_temp_5', label: 'Cyl 5', color: '#A855F7' },
        { dataKey: 'eg_temp_6', label: 'Cyl 6', color: '#EC4899' },
        { dataKey: 'eg_temp_7', label: 'Cyl 7', color: '#06B6D4' },
        { dataKey: 'eg_temp_8', label: 'Cyl 8', color: '#F97316' },
        { dataKey: 'eg_temp_9', label: 'Cyl 9', color: '#14B8A6' },
        { dataKey: 'eg_temp_out_turbo', label: 'TC Out', color: '#FFFFFF' },
      ],
      thresholds: { min: 100, max: 400 },
    },
    {
      title: 'H.T. Cooling Water Temperatures',
      yAxisLabel: 'Temp (°C)',
      series: [
        { dataKey: 'ht_cw_temp', label: 'HT CW Temp', color: '#06B6D4' },
        {
          dataKey: 'ht_cw_inlet_temp',
          label: 'HT CW Inlet Temp',
          color: '#F59E0B',
        },
        {
          dataKey: 'ht_cw_temp_out',
          label: 'HT CW Temp Out',
          color: '#A855F7',
        },
      ],
      thresholds: { min: 0, max: 110 },
    },
    {
      title: 'L.T. Cooling Water Temperature',
      yAxisLabel: 'Temp (°C)',
      series: [{ dataKey: 'lt_cw_temp', label: 'LT CW Temp' }],
      thresholds: { min: 0, max: 110 },
    },
    {
      title: 'Other Temperatures (LO / FO / Charge Air / Ambient)',
      yAxisLabel: 'Temp (°C)',
      series: [
        { dataKey: 'air_temp', label: 'Ambient Temp', color: '#3B82F6' },
        {
          dataKey: 'chargeair_temp_ac_out',
          label: 'Charge Air Temp AC Out',
          color: '#22C55E',
        },
        { dataKey: 'fo_temp_in', label: 'FO Temp In', color: '#EF4444' },
        { dataKey: 'lo_tc_temp', label: 'LO TC Temp', color: '#A855F7' },
        { dataKey: 'lo_temp_in', label: 'LO Temp In', color: '#F59E0B' },
      ],
      thresholds: { min: 0, max: 120 },
    },
    {
      title: 'Pressures (HT CW / LT CW / LO / FO)',
      yAxisLabel: 'Pressure (bar)',
      series: [
        { dataKey: 'ht_cw_press', label: 'HT CW Press', color: '#06B6D4' },
        { dataKey: 'lt_cw_press', label: 'LT CW Press', color: '#F59E0B' },
        { dataKey: 'lo_press', label: 'LO Press', color: '#A855F7' },
        { dataKey: 'fo_press_inlet', label: 'FO Press Inlet', color: '#EC4899' },
      ],
      thresholds: { min: 0, max: 20 },
    },
    {
      title: 'TC RPM & Fuel Rack Pos Trend',
      yAxisLabel: 'Value',
      series: [
        { dataKey: 'tc_rpm', label: 'TC RPM', color: '#3B82F6' },
        { dataKey: 'fpi', label: 'Fuel Rack Pos', color: '#F97316' },
      ],
    },
  ];

/** Must match `timeOptions` in real-time-data header-selectors */
const TREND_HEADER_TIME_PRESETS = new Set([
  '5 min',
  '30 min',
  '2 hours',
  '12h',
  '24h',
  '48h',
  'Custom Time',
]);

interface RightGaugeConfig {
  title: string;
  dataKey: string;
  min?: number;
  max: number;
  fillColor: string;
  unit?: string;
  decimals?: number;
  valueScale?: number;
  centerSuffix?: string;
}

const RIGHT_PANEL_GAUGES: RightGaugeConfig[] = [
  {
    title: 'Alternator Load (eKW)',
    dataKey: 'load_kw',
    min: 0,
    max: 1500,
    fillColor: '#65D16E',
    decimals: 0,
  },
  {
    title: 'Engine RPM',
    dataKey: 'rpm',
    min: 0,
    max: 900,
    fillColor: '#EAB308',
    unit: 'Engine Speed',
    decimals: 0,
    centerSuffix: ' rpm',
  },
  {
    title: 'TC RPM',
    dataKey: 'tc_rpm',
    min: 0,
    max: 2000,
    fillColor: '#65D16E',
    unit: 'x 10',
    decimals: 0,
    valueScale: 10,
  },
];

type RightRowWidget =
  | { type: 'gauge'; gauge: RightGaugeConfig }
  | { type: 'stats' }
  | {
      type: 'scatter';
      title: string;
      xKey: string;
      xLabel: string;
      yKey: string;
      yLabel: string;
      yScale?: number;
    };

const RIGHT_ROW_WIDGETS: RightRowWidget[] = [
  { type: 'gauge', gauge: RIGHT_PANEL_GAUGES[0] },
  { type: 'gauge', gauge: RIGHT_PANEL_GAUGES[1] },
  { type: 'gauge', gauge: RIGHT_PANEL_GAUGES[2] },
  { type: 'stats' },
  {
    type: 'scatter',
    title: 'TC RPM (x10) vs Load',
    xKey: 'tc_rpm',
    xLabel: 'tc_rpm',
    yKey: 'load_kw',
    yLabel: 'load',
    yScale: 10,
  },
  {
    type: 'scatter',
    title: 'Fuel Rack Pos vs Load',
    xKey: 'fpi',
    xLabel: 'fpi',
    yKey: 'load_kw',
    yLabel: 'load',
  },
];

function getLatestNumber(
  data: SensorDataPoint[],
  key: string
): number | undefined {
  const latest = data[data.length - 1];
  if (!latest) return undefined;
  const value = latest[key];
  return typeof value === 'number' ? value : undefined;
}

function formatNumber(value: number, decimals = 0): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function TrendRightGauge({
  config,
  data,
}: {
  config: RightGaugeConfig;
  data: SensorDataPoint[];
}) {
  const rawValue = getLatestNumber(data, config.dataKey);
  const gaugeValue =
    rawValue !== undefined ? rawValue / (config.valueScale ?? 1) : undefined;

  return (
    <PerfomaxCard
      title={config.title}
      titleClassName="text-xs font-medium leading-4 text-gray-300"
      headerClassName="px-3 pb-1 pt-2"
      className="flex h-full flex-col overflow-hidden rounded-sm border border-muted bg-[#0f172a]"
      bodyClassName="flex flex-1 items-center pb-1"
    >
      <SpeedMeter
        bare
        value={gaugeValue}
        min={config.min}
        max={config.max}
        fillColor={config.fillColor}
        unit={config.unit}
        centerLabel={
          gaugeValue !== undefined
            ? `${formatNumber(gaugeValue, config.decimals)}${config.centerSuffix ?? ''}`
            : '0'
        }
        gaugeHeight={250}
        size="default"
        className="w-full"
      />
    </PerfomaxCard>
  );
}

function TrendRightStatCard({ data }: { data: SensorDataPoint[] }) {
  const fuelRackPos = getLatestNumber(data, 'fpi') ?? 0;
  // UI-only for now: this placeholder uses sample_count until final mapping is provided.
  const runningHours = getLatestNumber(data, 'sample_count') ?? 0;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-sm border border-muted">
      <div className="grid grid-cols-2 bg-[#111827] text-[11px] font-medium text-gray-300">
        <div className="border-r border-[#1f2937] px-2 py-1">Fuel Rack Position</div>
        <div className="px-2 py-1">Total Running Hours</div>
      </div>
      <div className="grid flex-1 grid-cols-2">
        <div className="flex h-full items-center justify-center border-r border-[#1f2937] bg-gradient-to-b from-[#2d7eff] to-[#1e40af]">
          <span className="text-4xl font-semibold text-white">
            {formatNumber(fuelRackPos, 0)}
          </span>
        </div>
        <div className="flex h-full items-center justify-center bg-gradient-to-b from-[#2d7eff] to-[#1e40af]">
          <span className="text-4xl font-semibold text-white">
            {formatNumber(runningHours, 0)}
          </span>
        </div>
      </div>
    </div>
  );
}

function TrendMiniScatterCard({
  title,
  data,
  xKey,
  xLabel,
  yKey,
  yLabel,
  yScale = 1,
}: {
  title: string;
  data: SensorDataPoint[];
  xKey: string;
  xLabel: string;
  yKey: string;
  yLabel: string;
  yScale?: number;
}) {
  const plotData = useMemo(
    () =>
      data
        .map((point) => {
          const xRaw = point[xKey];
          const yRaw = point[yKey];
          if (typeof xRaw !== 'number' || typeof yRaw !== 'number') return null;
          return { x: xRaw, y: yRaw / yScale };
        })
        .filter((point): point is { x: number; y: number } => point !== null),
    [data, xKey, yKey, yScale]
  );

  return (
    <PerfomaxCard
      title={title}
      titleClassName="text-xs font-medium leading-4 text-gray-300"
      headerClassName="px-3 pb-1 pt-2"
      className="flex h-full flex-col rounded-sm border border-muted bg-[#0f172a]"
      bodyClassName="flex-1 px-2 pb-2"
    >
      <div className="h-full min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 8, right: 8, left: -8, bottom: 4 }}>
            <CartesianGrid stroke="rgba(148,163,184,0.2)" />
            <XAxis
              dataKey="x"
              type="number"
              tick={{ fill: '#94a3b8', fontSize: 9 }}
              axisLine={{ stroke: '#334155' }}
              tickLine={false}
              label={{
                value: xLabel,
                position: 'insideBottom',
                fill: '#94a3b8',
                offset: -2,
                fontSize: 9,
              }}
            />
            <YAxis
              dataKey="y"
              type="number"
              tick={{ fill: '#94a3b8', fontSize: 9 }}
              axisLine={false}
              tickLine={false}
              label={{
                value: yLabel,
                angle: -90,
                position: 'insideLeft',
                fill: '#94a3b8',
                fontSize: 9,
              }}
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{
                background: '#0b1220',
                border: '1px solid #334155',
                borderRadius: 8,
                color: '#e2e8f0',
                fontSize: 12,
              }}
            />
            <Scatter
              data={plotData}
              fill="#65D16E"
              fillOpacity={0.8}
              shape="circle"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </PerfomaxCard>
  );
}

export default function TrendAnalysisLayout() {
  const selectedShip = useAtomValue(selectedShipAtom);
  const [selectedTime, setSelectedTime] = useAtom(selectedTimeAtom);
  const setRefreshTrigger = useSetAtom(refreshTriggerAtom);
  const handleRefresh = useCallback(
    () => setRefreshTrigger((value) => value + 1),
    [setRefreshTrigger]
  );
  const { data: sensorData, isLoading } = useSensorDataApi();
  const [hasLoadedAtLeastOnce, setHasLoadedAtLeastOnce] = useState(false);

  useEffect(() => {
    if (!TREND_HEADER_TIME_PRESETS.has(selectedTime)) {
      setSelectedTime('24h');
    }
  }, [selectedTime, setSelectedTime]);

  useEffect(() => {
    if (!isLoading) {
      setHasLoadedAtLeastOnce(true);
    }
  }, [isLoading]);

  if (!selectedShip) {
    return (
      <div className="flex h-96 items-center justify-center">
        <span className="text-muted-foreground">Loading vessel data…</span>
      </div>
    );
  }

  const isInitialLoading = isLoading && !hasLoadedAtLeastOnce;
  const isRefreshing = isLoading && hasLoadedAtLeastOnce;

  const renderRightWidget = (widget: RightRowWidget) => {
    if (widget.type === 'gauge') {
      return <TrendRightGauge config={widget.gauge} data={sensorData} />;
    }

    if (widget.type === 'stats') {
      return <TrendRightStatCard data={sensorData} />;
    }

    return (
      <TrendMiniScatterCard
        title={widget.title}
        data={sensorData}
        xKey={widget.xKey}
        xLabel={widget.xLabel}
        yKey={widget.yKey}
        yLabel={widget.yLabel}
        yScale={widget.yScale}
      />
    );
  };

  return (
    <div className="space-y-6">
      <AutoRefreshCountdown
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        intervalSeconds={AUTO_REFRESH_INTERVAL_SECONDS}
      />

      <div className="space-y-6">
        {SENSOR_CHART_ROWS.map((row, index) => {
          const rightWidget = RIGHT_ROW_WIDGETS[index];

          return (
            <div
              key={row.title}
              className={
                rightWidget
                  ? 'grid grid-cols-1 gap-4 2xl:grid-cols-[minmax(0,1fr)_320px]'
                  : 'grid grid-cols-1'
              }
            >
              <SensorLineChart
                title={row.title}
                yAxisLabel={row.yAxisLabel}
                series={row.series}
                data={sensorData}
                isLoading={isInitialLoading}
                thresholds={row.thresholds}
                tooltipColumns={row.series.length > 5 ? 2 : undefined}
                className="h-full"
              />

              {rightWidget && <div className="h-full">{renderRightWidget(rightWidget)}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
