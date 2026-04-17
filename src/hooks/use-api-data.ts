'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { setAccessToken, setRefreshToken } from '@/services/api-client';
import * as api from '@/services/api';

// Mock data fallbacks
import {
  shipData,
  engineData as defaultEngineData,
  type Ship,
} from '@/data/nura/ships';
import {
  vesselAlarmData as mockAlarmData,
  type AlarmEntry,
} from '@/data/nura/alarm-data';

// Types
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

// ─── Single vessel position (polls like fleet map — default 10s) ──────────────

export function useVesselPosition(vesselId: number, pollMs = 10000) {
  const token = useApiToken();
  const [position, setPosition] = useState<Ship['position'] | null>(null);

  useEffect(() => {
    setPosition(null);
    if (!token || !vesselId) return;

    let cancelled = false;
    const load = () => {
      api
        .fetchVesselPosition(vesselId)
        .then((res) => {
          if (cancelled) return;
          setPosition({
            lat: res.lat,
            long: res.long,
            direction: res.direction,
            timestamp: res.timestamp,
          });
        })
        .catch(() => {});
    };

    load();
    const id = setInterval(load, pollMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [token, vesselId, pollMs]);

  return position;
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
      .fetchVesselEngines(vesselId)
      .then((res) => {
        const allEngines = [...(res.main_engines || []), ...(res.gensets || [])];

        // Separate by prefix: me* or dg* → main engines, ae* → gensets
        setMainEngines(
          allEngines.filter(
            (e) =>
              e.id.toLowerCase().startsWith('me') ||
              e.id.toLowerCase().startsWith('dg')
          )
        );
        setGensets(
          allEngines.filter((e) => e.id.toLowerCase().startsWith('ae'))
        );
      })
      .catch((err) => {
        console.error('Failed to fetch vessel engines:', err);
        // If API fails, show no data instead of mock data
        setMainEngines([]);
        setGensets([]);
      });
  }, [token, vesselId]);

  return { mainEngines, gensets };
}

// ─── Filtered alarms for a vessel ────────────────────────────────────────────

export function useVesselAlarmData(
  vesselId: number,
  engine?: string,
  refreshTrigger = 0
) {
  const token = useApiToken();
  const fallback = useMemo(() => {
    return (mockAlarmData as Record<number, AlarmEntry[]>)[vesselId] ?? [];
  }, [vesselId]);

  const [data, setData] = useState<AlarmEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const previousContextKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const contextKey = `${vesselId ?? ''}|${engine ?? ''}`;
    const isSameContext = previousContextKeyRef.current === contextKey;
    previousContextKeyRef.current = contextKey;

    // Keep existing rows during a silent auto-refresh to avoid flicker; only
    // clear when the vessel/engine context actually changes.
    if (!isSameContext) {
      setData([]);
    }

    if (!token) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    let cancelled = false;
    api
      .fetchVesselAlarmsFiltered(vesselId, engine)
      .then((alarms) => {
        if (cancelled) return;
        setData(
          (alarms as unknown as AlarmEntry[]).map((a) => ({
            ...a,
            date: a.timestamp,
            time: a.timestamp,
          })) as any
        );
      })
      .catch(() => {
        if (!cancelled) setData(fallback);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, vesselId, engine, fallback, refreshTrigger]);

  return { data, isLoading };
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
