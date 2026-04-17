'use client';

import AutoRefreshCountdown from '@/components/auto-refresh-countdown';
import SensorLineChart, {
  type SensorSeries,
} from '@/components/machinery/condition-monitoring/sensor-line-chart';
import { useSensorDataApi } from '@/hooks/use-machinery-data';
import {
  refreshTriggerAtom,
  selectedShipAtom,
  selectedTimeAtom,
} from '@/store/condition-monitoring-atoms';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useCallback, useEffect, useState } from 'react';

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

  return (
    <div className="space-y-6">
      <AutoRefreshCountdown
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        intervalSeconds={AUTO_REFRESH_INTERVAL_SECONDS}
      />

      {SENSOR_CHART_ROWS.map((row) => (
        <SensorLineChart
          key={row.title}
          title={row.title}
          yAxisLabel={row.yAxisLabel}
          series={row.series}
          data={sensorData}
          isLoading={isInitialLoading}
          thresholds={row.thresholds}
          tooltipColumns={row.series.length > 5 ? 2 : undefined}
        />
      ))}
    </div>
  );
}
