'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useMemo, useState } from 'react';
import { setAccessToken } from '@/services/api-client';
import * as api from '@/services/api';
import {
  dateRangeAtom,
  selectedEngineAtom,
  selectedShipAtom,
  selectedTimeAtom,
} from '@/store/condition-monitoring-atoms';
import { overviewTimeAtom } from '@/components/machinery/machinery-overview/header-selectors';
import { useAtomValue } from 'jotai';
import type {
  AlarmsWithSummaryResponse,
  DeltaDeviationResponse,
  EngineOverviewCard,
  FuelRateResponse,
  HealthScoreEntry,
  ParameterScatterResponse,
  SensorDataPoint,
  SfocResponse,
  SparePartEntry,
  AlarmWithUnit,
  LatestSensorDataResponse,
} from '@/types/api';

// ─── Internal: sync NextAuth token to api-client ─────────────────────────────

function useApiToken(): string | null {
  const { data: session } = useSession();
  const token = (session as any)?.accessToken ?? null;
  useEffect(() => {
    if (token) setAccessToken(token);
  }, [token]);
  return token;
}

// ─── Time range helpers ──────────────────────────────────────────────────────

function getDateRange(
  preset: string,
  customRange: [Date | null, Date | null]
): { from: string; to: string } {
  const now = new Date();
  let from: Date;

  switch (preset) {
    case '1h':
      from = new Date(now.getTime() - 60 * 60 * 1000);
      break;
    case '1d':
    case '24h':
      from = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '1m':
    case '30d':
      from = new Date(now);
      from.setMonth(from.getMonth() - 1);
      break;
    case '3m':
    case '90d':
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
      from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    default:
      from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  return { from: from.toISOString(), to: now.toISOString() };
}

// ─── Machinery Overview ──────────────────────────────────────────────────────

export function useMachineryOverview() {
  const token = useApiToken();
  const selectedShip = useAtomValue(selectedShipAtom);
  const selectedTime = useAtomValue(overviewTimeAtom);
  const [engines, setEngines] = useState<EngineOverviewCard[]>([]);
  const [loading, setLoading] = useState(true);

  const vesselId = selectedShip?.id;
  const period = selectedTime?.value ?? '7d';

  useEffect(() => {
    setEngines([]);
    setLoading(true);
    if (!token || !vesselId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    api
      .fetchMachineryOverview(vesselId, period)
      .then((data) => {
        if (!cancelled) setEngines(data);
      })
      .catch(() => {
        if (!cancelled) setEngines([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, vesselId, period]);

  return { engines, loading };
}

// ─── Sensor Data (replaces useSensorData with API-key) ───────────────────────

export function useSensorDataApi() {
  const token = useApiToken();
  const selectedShip = useAtomValue(selectedShipAtom);
  const selectedEngine = useAtomValue(selectedEngineAtom);
  const selectedTime = useAtomValue(selectedTimeAtom);
  const dateRange = useAtomValue(dateRangeAtom);

  const [data, setData] = useState<SensorDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const vesselId = selectedShip?.id;
  const engineValue = selectedEngine?.value;
  const { from, to } = useMemo(
    () => getDateRange(selectedTime, dateRange),
    [selectedTime, dateRange]
  );

  useEffect(() => {
    setData([]);
    setIsLoading(true);
    setError(null);

    if (!token || !vesselId) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    api
      .fetchSensorData(vesselId, from, to, engineValue)
      .then((res) => {
        if (!cancelled) setData(res.data ?? []);
      })
      .catch((err: any) => {
        if (!cancelled) {
          setError(err.message ?? 'Failed to fetch sensor data');
          setData([]);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, vesselId, engineValue, from, to]);

  return { data, isLoading, error };
}

// ─── Delta Deviation ─────────────────────────────────────────────────────────

export function useDeltaDeviation() {
  const token = useApiToken();
  const selectedShip = useAtomValue(selectedShipAtom);
  const selectedEngine = useAtomValue(selectedEngineAtom);
  const selectedTime = useAtomValue(selectedTimeAtom);
  const dateRange = useAtomValue(dateRangeAtom);

  const [response, setResponse] = useState<DeltaDeviationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const vesselId = selectedShip?.id;
  const engineValue = selectedEngine?.value;
  const { from, to } = useMemo(
    () => getDateRange(selectedTime, dateRange),
    [selectedTime, dateRange]
  );

  useEffect(() => {
    setResponse(null);
    setIsLoading(true);
    if (!token || !vesselId) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    api
      .fetchDeltaDeviation(vesselId, from, to, engineValue)
      .then((res) => {
        if (!cancelled) setResponse(res);
      })
      .catch(() => {
        if (!cancelled) setResponse(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, vesselId, engineValue, from, to]);

  return { response, isLoading };
}

// ─── Parameter Scatter ───────────────────────────────────────────────────────

export function useParameterScatter() {
  const token = useApiToken();
  const selectedShip = useAtomValue(selectedShipAtom);
  const selectedEngine = useAtomValue(selectedEngineAtom);
  const selectedTime = useAtomValue(selectedTimeAtom);
  const dateRange = useAtomValue(dateRangeAtom);

  const [response, setResponse] = useState<ParameterScatterResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  const vesselId = selectedShip?.id;
  const engineValue = selectedEngine?.value;
  const { from, to } = useMemo(
    () => getDateRange(selectedTime, dateRange),
    [selectedTime, dateRange]
  );

  useEffect(() => {
    setResponse(null);
    setIsLoading(true);
    if (!token || !vesselId) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    api
      .fetchParameterScatter(vesselId, from, to, engineValue)
      .then((res) => {
        if (!cancelled) setResponse(res);
      })
      .catch(() => {
        if (!cancelled) setResponse(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, vesselId, engineValue, from, to]);

  return { response, isLoading };
}

// ─── SFOC Scatter ────────────────────────────────────────────────────────────

export function useSfocScatter() {
  const token = useApiToken();
  const selectedShip = useAtomValue(selectedShipAtom);
  const selectedEngine = useAtomValue(selectedEngineAtom);
  const selectedTime = useAtomValue(selectedTimeAtom);
  const dateRange = useAtomValue(dateRangeAtom);

  const [response, setResponse] = useState<SfocResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const vesselId = selectedShip?.id;
  const engineValue = selectedEngine?.value;
  const { from, to } = useMemo(
    () => getDateRange(selectedTime, dateRange),
    [selectedTime, dateRange]
  );

  useEffect(() => {
    setResponse(null);
    setIsLoading(true);
    if (!token || !vesselId) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    api
      .fetchSfoc(vesselId, from, to, engineValue)
      .then((res) => {
        if (!cancelled) setResponse(res);
      })
      .catch(() => {
        if (!cancelled) setResponse(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, vesselId, engineValue, from, to]);

  return { response, isLoading };
}

// ─── Fuel Rate ───────────────────────────────────────────────────────────────

export function useFuelRate() {
  const token = useApiToken();
  const selectedShip = useAtomValue(selectedShipAtom);
  const selectedEngine = useAtomValue(selectedEngineAtom);
  const selectedTime = useAtomValue(selectedTimeAtom);
  const dateRange = useAtomValue(dateRangeAtom);

  const [response, setResponse] = useState<FuelRateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const vesselId = selectedShip?.id;
  const engineValue = selectedEngine?.value;
  const { from, to } = useMemo(
    () => getDateRange(selectedTime, dateRange),
    [selectedTime, dateRange]
  );

  useEffect(() => {
    setResponse(null);
    setIsLoading(true);
    if (!token || !vesselId) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    api
      .fetchFuelRate(vesselId, from, to, engineValue)
      .then((res) => {
        if (!cancelled) setResponse(res);
      })
      .catch(() => {
        if (!cancelled) setResponse(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, vesselId, engineValue, from, to]);

  return { response, isLoading };
}

// ─── Health Scores ───────────────────────────────────────────────────────────

export function useHealthScores() {
  const token = useApiToken();
  const selectedShip = useAtomValue(selectedShipAtom);
  const selectedEngine = useAtomValue(selectedEngineAtom);

  const [scores, setScores] = useState<HealthScoreEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const vesselId = selectedShip?.id;
  const engineValue = selectedEngine?.value;

  useEffect(() => {
    setScores([]);
    setIsLoading(true);
    if (!token || !vesselId) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    api
      .fetchHealthScores(vesselId, engineValue)
      .then((res) => {
        if (!cancelled) setScores(res.scores ?? []);
      })
      .catch(() => {
        if (!cancelled) setScores([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, vesselId, engineValue]);

  return { scores, isLoading };
}

// ─── Spare Parts ─────────────────────────────────────────────────────────────

export function useSpareParts() {
  const token = useApiToken();
  const selectedShip = useAtomValue(selectedShipAtom);
  const selectedEngine = useAtomValue(selectedEngineAtom);

  const [parts, setParts] = useState<SparePartEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const vesselId = selectedShip?.id;
  const engineValue = selectedEngine?.value;

  useEffect(() => {
    setParts([]);
    setIsLoading(true);
    if (!token || !vesselId) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    api
      .fetchSpareParts(vesselId, engineValue)
      .then((res) => {
        if (!cancelled) setParts(res.parts ?? []);
      })
      .catch(() => {
        if (!cancelled) setParts([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, vesselId, engineValue]);

  return { parts, isLoading };
}

// ─── Alarms with Summary ────────────────────────────────────────────────────

export function useAlarmsWithSummary(params?: {
  engine?: string;
  status?: string;
  category?: string;
  limit?: number;
}) {
  const token = useApiToken();
  const selectedShip = useAtomValue(selectedShipAtom);

  const [alarms, setAlarms] = useState<AlarmWithUnit[]>([]);
  const [summary, setSummary] = useState<AlarmsWithSummaryResponse['summary']>({
    critical: 0,
    warning: 0,
    notice: 0,
    info: 0,
    active: 0,
    resolved: 0,
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const vesselId = selectedShip?.id;
  const paramsKey = JSON.stringify(params);

  useEffect(() => {
    setAlarms([]);
    setSummary({
      critical: 0,
      warning: 0,
      notice: 0,
      info: 0,
      active: 0,
      resolved: 0,
      total: 0,
    });
    setIsLoading(true);
    if (!token || !vesselId) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    api
      .fetchAlarmsWithSummary(vesselId, params)
      .then((res) => {
        if (!cancelled) {
          setAlarms(res.alarms ?? []);
          setSummary(res.summary);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAlarms([]);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, vesselId, paramsKey]);

  return { alarms, summary, isLoading };
}

// ─── Latest Sensor Values ───────────────────────────────────────────────────

export function useLatestSensorValues() {
  const token = useApiToken();
  const selectedShip = useAtomValue(selectedShipAtom);

  const [response, setResponse] = useState<LatestSensorDataResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const vesselId = selectedShip?.id;

  useEffect(() => {
    setResponse(null);
    setIsLoading(true);
    if (!token || !vesselId) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    api
      .fetchLatestSensorValues(vesselId)
      .then((res: LatestSensorDataResponse) => {
        if (!cancelled) setResponse(res);
      })
      .catch(() => {
        if (!cancelled) setResponse(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, vesselId]);

  return { response, isLoading };
}
