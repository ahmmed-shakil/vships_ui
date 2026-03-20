'use client';

import {
  dateRangeAtom,
  selectedEngineAtom,
  selectedTimeAtom,
} from '@/store/condition-monitoring-atoms';
import { useAtomValue } from 'jotai';
import { useCallback, useEffect, useMemo, useState } from 'react';

const IMO = '9274410';

export interface SensorDataPoint {
  timestamp: string;
  asset_id: string;
  device_id: number;
  rpm: number | null;
  max_rpm: number | null;
  min_rpm: number | null;
  tc_rpm: number | null;
  fpi: number | null;
  fo_flow_inlet: number | null;
  fo_flow_outlet: number | null;
  eg_temp_1: number | null;
  eg_temp_2: number | null;
  eg_temp_3: number | null;
  eg_temp_4: number | null;
  eg_temp_5: number | null;
  eg_temp_6: number | null;
  eg_temp_7: number | null;
  eg_temp_8: number | null;
  eg_temp_mean: number | null;
  max_eg_temp_mean: number | null;
  exh_gas_temp: number | null;
  eg_temp_out_turbo: number | null;
  fo_press_inlet: number | null;
  lo_press: number | null;
  chargeair_press: number | null;
  lo_temp: number | null;
  ht_cw_temp: number | null;
  ht_cw_inlet_temp: number | null;
  lt_cw_temp: number | null;
  chargeair_temp: number | null;
  gen_voltage: number | null;
  bus_freq: number | null;
  cos_phi: number | null;
  sample_count: number;
  [key: string]: string | number | null;
}

export interface SensorApiResponse {
  count: number;
  data: SensorDataPoint[];
  from: string;
  resolution: string;
  to: string;
  vessel: {
    id: number;
    imo: string;
    name: string;
  };
}

function getDateRange(
  preset: string,
  customRange: [Date | null, Date | null]
): { from: string; to: string } {
  const now = new Date();
  let from: Date;
  const to = now;

  switch (preset) {
    case '1h':
      from = new Date(now.getTime() - 60 * 60 * 1000);
      break;
    case '1d':
      from = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '1m':
      from = new Date(now);
      from.setMonth(from.getMonth() - 1);
      break;
    case '3m':
      from = new Date(now);
      from.setMonth(from.getMonth() - 3);
      break;
    case 'Custom Time':
      if (customRange[0] && customRange[1]) {
        return {
          from: customRange[0].toISOString(),
          to: customRange[1].toISOString(),
        };
      }
      // fallback to 7d if custom not set
      from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    default:
      from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  return { from: from.toISOString(), to: to.toISOString() };
}

/**
 * Map engine atom value to the asset_id used in the API response.
 * ME1 = ME Port, ME2 = ME Stbd
 */
function engineValueToAssetId(engineValue: string): string | null {
  switch (engineValue) {
    case 'me1':
      return 'ME1';
    case 'me2':
      return 'ME2';
    default:
      return null;
  }
}

export function useSensorData() {
  const selectedTime = useAtomValue(selectedTimeAtom);
  const dateRange = useAtomValue(dateRangeAtom);
  const selectedEngine = useAtomValue(selectedEngineAtom);

  const [rawData, setRawData] = useState<SensorDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { from, to } = useMemo(
    () => getDateRange(selectedTime, dateRange),
    [selectedTime, dateRange]
  );

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ imo: IMO, from, to });
      const res = await fetch(`/api/sensor?${params.toString()}`);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const json = (await res.json()) as SensorApiResponse;
      setRawData(json.data ?? []);
    } catch (err: any) {
      setError(err.message ?? 'Failed to fetch sensor data');
      setRawData([]);
    } finally {
      setIsLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter by selected engine
  const assetId = engineValueToAssetId(selectedEngine?.value ?? '');
  const data = useMemo(
    () => (assetId ? rawData.filter((d) => d.asset_id === assetId) : rawData),
    [rawData, assetId]
  );

  return { data, isLoading, error, refetch: fetchData };
}
