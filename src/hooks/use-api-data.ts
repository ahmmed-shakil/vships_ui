'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useMemo, useState } from 'react';
import { setAccessToken, setRefreshToken } from '@/services/api-client';
import * as api from '@/services/api';

// Mock data fallbacks
import { shipData, engineData as defaultEngineData } from '@/data/nura/ships';
import { vesselAlarmData as mockAlarmData } from '@/data/nura/alarm-data';

// Types
import type { Ship } from '@/data/nura/ships';
import type { AlarmEntry } from '@/data/nura/alarm-data';
import type { FleetVessel } from '@/data/nura/fleet-data';
import type { EngineMonitorData } from '@/data/nura/engine-data';

// ─── Internal: sync NextAuth token to api-client ─────────────────────────────

function useApiToken(): string | null {
  const { data: session } = useSession();
  const token = (session as any)?.accessToken ?? null;
  const refresh = (session as any)?.refreshToken ?? null;
  useEffect(() => {
    if (token) setAccessToken(token);
    if (refresh) setRefreshToken(refresh);
  }, [token, refresh]);
  return token;
}

// ─── Vessel dropdown options ─────────────────────────────────────────────────

export function useVesselOptions(onLoaded?: (vessels: Ship[]) => void): Ship[] {
  const token = useApiToken();
  const [vessels, setVessels] = useState<Ship[]>([]);

  useEffect(() => {
    if (!token) return;
    api
      .fetchVessels()
      .then((v) => {
        const list = v.length > 0 ? (v as unknown as Ship[]) : shipData;
        setVessels(list);
        onLoaded?.(list);
      })
      .catch(() => {
        setVessels(shipData);
        onLoaded?.(shipData);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return vessels;
}

// ─── Engine dropdown options ─────────────────────────────────────────────────

export function useEngineOptionsList(): typeof defaultEngineData {
  const token = useApiToken();
  const [engines, setEngines] = useState<typeof defaultEngineData>([]);

  useEffect(() => {
    if (!token) return;
    api
      .fetchEngineOptions()
      .then((e) => {
        const list = e.length > 0 ? e : defaultEngineData;
        // Ensure "All Engine" is always the first option
        const hasAll = list.some((opt) => opt.value === 'all');
        const withAll = hasAll
          ? list
          : [{ label: 'All Engine', value: 'all' }, ...list];
        setEngines(withAll as typeof defaultEngineData);
      })
      .catch(() => setEngines(defaultEngineData));
  }, [token]);

  return engines;
}

// ─── Fleet vessel positions (with polling) ───────────────────────────────────

export function useFleetData(pollMs = 10000) {
  const token = useApiToken();
  const [data, setData] = useState<FleetVessel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    const load = () => {
      api
        .fetchFleetVessels()
        .then((result) => {
          if (!cancelled) setData(result as unknown as FleetVessel[]);
        })
        .catch(() => {})
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    };

    load();
    const id = setInterval(load, pollMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [token, pollMs]);

  return { data, loading };
}

// ─── All vessel alarms (for fleet map popups) ────────────────────────────────

export function useAllVesselAlarms(vesselIds: number[]) {
  const token = useApiToken();
  const [data, setData] = useState<Record<number, AlarmEntry[]>>({});

  const idsKey = useMemo(
    () => [...vesselIds].sort((a, b) => a - b).join(','),
    [vesselIds]
  );

  useEffect(() => {
    if (!token || vesselIds.length === 0) return;

    let cancelled = false;
    Promise.all(
      vesselIds.map((id) =>
        api
          .fetchVesselAlarms(id)
          .then((alarms) => ({ id, alarms }))
          .catch(() => ({ id, alarms: [] as AlarmEntry[] }))
      )
    ).then((results) => {
      if (cancelled) return;
      const map: Record<number, AlarmEntry[]> = {};
      results.forEach(({ id, alarms }) => {
        map[id] = alarms as unknown as AlarmEntry[];
      });
      setData(map);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, idsKey]);

  return data;
}

// ─── Emission zones ──────────────────────────────────────────────────────────

export function useEmissionZoneData() {
  const token = useApiToken();
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;
    api
      .fetchEmissionZones()
      .then((zones) => {
        setData(zones as any);
      })
      .catch(() => {});
  }, [token]);

  return data;
}

// ─── Vessel engine data ─────────────────────────────────────────────────────

/** Convert API pressure values from bar to kPa (×100) */
function convertPressures(engine: EngineMonitorData): EngineMonitorData {
  if (!engine.detail) return engine;
  return {
    ...engine,
    detail: {
      ...engine.detail,
      lubeoil_press: engine.detail.lubeoil_press * 100,
      coolant_press: engine.detail.coolant_press * 100,
    },
  };
}

export function useVesselEngineData(vesselId: number) {
  const token = useApiToken();
  const [mainEngines, setMainEngines] = useState<EngineMonitorData[]>([]);
  const [gensets, setGensets] = useState<EngineMonitorData[]>([]);

  useEffect(() => {
    // Reset on vessel change
    setMainEngines([]);
    setGensets([]);

    if (!token) return;

    api
      .fetchEngineOptions(vesselId)
      .then((options) => {
        // Filter out "all" option, build EngineMonitorData with zeroed values
        const engines = options
          .filter((o) => o.value !== 'all')
          .map(
            (o): EngineMonitorData => ({
              id: o.value,
              label: o.label,
              flowMeter: { fm_in: 0, fm_cons: 0, fm_out: 0 },
              gauge: { engine_rpm: 0, engine_load: 0, fuel_cons: 0 },
              totals: { total_fuel: 0, running_hours: 0 },
              detail: undefined,
            })
          );

        // Separate by prefix: me* → main engines, ae* → gensets
        setMainEngines(engines.filter((e) => e.id.startsWith('me')));
        setGensets(engines.filter((e) => e.id.startsWith('ae')));
      })
      .catch(() => {
        // If API fails, show no data instead of mock data
        setMainEngines([]);
        setGensets([]);
      });
  }, [token, vesselId]);

  return { mainEngines, gensets };
}

// ─── Filtered alarms for a vessel ────────────────────────────────────────────

export function useVesselAlarmData(vesselId: number, engine?: string) {
  const token = useApiToken();
  const fallback = useMemo(() => {
    return (mockAlarmData as Record<number, AlarmEntry[]>)[vesselId] ?? [];
  }, [vesselId]);

  const [data, setData] = useState<AlarmEntry[]>([]);

  useEffect(() => {
    setData([]);
    if (!token) return;

    api
      .fetchVesselAlarmsFiltered(vesselId, engine)
      .then((alarms) => {
        setData(
          (alarms as unknown as AlarmEntry[]).map((a) => ({
            ...a,
            date: a.timestamp,
            time: a.timestamp,
          })) as any
        );
      })
      .catch(() => setData(fallback));
  }, [token, vesselId, engine, fallback]);

  return data;
}

// ─── Chart data (consumption vs speed + engine consumption) ──────────────────

export function useChartData(vesselId: number) {
  const token = useApiToken();
  const [consumptionVsSpeed, setConsumptionVsSpeed] = useState<any[]>([]);

  useEffect(() => {
    setConsumptionVsSpeed([]);
    if (!token) return;

    api
      .fetchConsumptionVsSpeed(vesselId)
      .then((data) => {
        setConsumptionVsSpeed(data.length > 0 ? (data as any) : []);
      })
      .catch(() => setConsumptionVsSpeed([]));
  }, [token, vesselId]);

  return { consumptionVsSpeed };
}
