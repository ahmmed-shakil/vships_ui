import { apiFetch, serverApiFetch } from './api-client';
import type {
  AlarmEntry,
  AlarmsWithSummaryResponse,
  ApiUser,
  ConsumptionSpeedPoint,
  DeltaDeviationResponse,
  EmissionZone,
  EngineConsumptionPoint,
  EngineOption,
  EngineOverviewCard,
  FleetVessel,
  FuelRateResponse,
  HealthScoresResponse,
  LoginRequest,
  LoginResponse,
  MachineryScoreEntry,
  Notification,
  ParameterScatterResponse,
  SensorDataResponse,
  SfocResponse,
  Ship,
  SparePartsResponse,
  VesselEnginesResponse,
} from '@/types/api';

// ─── Auth (server-side only — called from NextAuth authorize) ─────────────────

export async function loginUser(data: LoginRequest): Promise<LoginResponse> {
  return serverApiFetch<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: data,
    skipAuth: true,
  });
}

// ─── User Profile ─────────────────────────────────────────────────────────────

export async function fetchUserProfile(): Promise<ApiUser> {
  return apiFetch<ApiUser>('/api/user/profile');
}

// ─── Vessels ──────────────────────────────────────────────────────────────────

export async function fetchVessels(): Promise<Ship[]> {
  const res = await apiFetch<{ vessels: Ship[] }>('/api/vessels');
  return res.vessels;
}

export async function fetchEngineOptions(
  vesselId?: number
): Promise<EngineOption[]> {
  const qs = vesselId ? `?vessel_id=${vesselId}` : '';
  const res = await apiFetch<{ engines: EngineOption[] }>(`/api/engines${qs}`);
  return res.engines;
}

// ─── Fleet Overview ───────────────────────────────────────────────────────────

export async function fetchFleetVessels(): Promise<FleetVessel[]> {
  const res = await apiFetch<{ vessels: FleetVessel[] }>('/api/fleet/vessels');
  return res.vessels;
}

export async function fetchVesselAlarms(
  vesselId: number
): Promise<AlarmEntry[]> {
  const res = await apiFetch<{ alarms: AlarmEntry[] }>(
    `/api/fleet/vessels/${vesselId}/alarms`
  );
  return res.alarms;
}

export async function fetchEmissionZones(): Promise<EmissionZone[]> {
  const res = await apiFetch<{ zones: EmissionZone[] }>(
    '/api/fleet/emission-zones'
  );
  return res.zones;
}

// ─── Engine Data ──────────────────────────────────────────────────────────────

export async function fetchVesselEngines(
  vesselId: number
): Promise<VesselEnginesResponse> {
  return apiFetch<VesselEnginesResponse>(`/api/engines?vessel_id=${vesselId}`);
}

// ─── Charts ───────────────────────────────────────────────────────────────────

export async function fetchConsumptionVsSpeed(
  vesselId: number,
  date?: string
): Promise<ConsumptionSpeedPoint[]> {
  const qs = date ? `?date=${date}` : '';
  const res = await apiFetch<{ data: ConsumptionSpeedPoint[] }>(
    `/api/vessels/${vesselId}/charts/consumption-vs-speed${qs}`
  );
  return res.data;
}

export async function fetchEngineConsumption(
  vesselId: number,
  date?: string
): Promise<EngineConsumptionPoint[]> {
  const qs = date ? `?date=${date}` : '';
  const res = await apiFetch<{ data: EngineConsumptionPoint[] }>(
    `/api/vessels/${vesselId}/charts/engine-consumption${qs}`
  );
  return res.data;
}

// ─── Vessel Position ──────────────────────────────────────────────────────────

export async function fetchVesselPosition(vesselId: number) {
  return apiFetch<{
    vessel_id: number;
    name: string;
    lat: number;
    long: number;
    direction: number;
    timestamp: number;
  }>(`/api/vessels/${vesselId}/position`);
}

// ─── Alarms (filtered) ───────────────────────────────────────────────────────

export async function fetchVesselAlarmsFiltered(
  vesselId: number,
  engine?: string
): Promise<AlarmEntry[]> {
  const qs = engine && engine !== 'all' ? `?engine=${engine}` : '';
  const res = await apiFetch<{ alarms: AlarmEntry[] }>(
    `/api/vessels/${vesselId}/alarms${qs}`
  );
  return res.alarms;
}

// ─── Machinery Scores ─────────────────────────────────────────────────────────

export async function fetchMachineryScores(
  vesselId: number
): Promise<MachineryScoreEntry[]> {
  const res = await apiFetch<{ scores: MachineryScoreEntry[] }>(
    `/api/vessels/${vesselId}/machinery-scores`
  );
  return res.scores;
}

// ─── Notifications ────────────────────────────────────────────────────────────

export async function fetchNotifications(): Promise<Notification[]> {
  const res = await apiFetch<{ notifications: Notification[] }>(
    '/api/notifications'
  );
  return res.notifications ?? [];
}

// ─── Machinery Overview ───────────────────────────────────────────────────────

export async function fetchMachineryOverview(
  vesselId: number,
  period = '7d'
): Promise<EngineOverviewCard[]> {
  const res = await apiFetch<{ engines: EngineOverviewCard[] }>(
    `/api/vessels/${vesselId}/machinery-overview?period=${period}`
  );
  return res.engines;
}

// ─── Alarms with Summary ──────────────────────────────────────────────────────

export async function fetchAlarmsWithSummary(
  vesselId: number,
  params?: {
    engine?: string;
    status?: string;
    category?: string;
    limit?: number;
  }
): Promise<AlarmsWithSummaryResponse> {
  const qs = new URLSearchParams();
  if (params?.engine && params.engine !== 'all')
    qs.set('engine', params.engine);
  if (params?.status) qs.set('status', params.status);
  if (params?.category) qs.set('category', params.category);
  if (params?.limit) qs.set('limit', String(params.limit));
  const query = qs.toString();
  return apiFetch<AlarmsWithSummaryResponse>(
    `/api/vessels/${vesselId}/alarms${query ? `?${query}` : ''}`
  );
}

// ─── Sensor Time-Series Data ──────────────────────────────────────────────────

export async function fetchSensorData(
  vesselId: number,
  from: string,
  to: string,
  engine?: string
): Promise<SensorDataResponse> {
  const qs = new URLSearchParams({ from, to });
  if (engine && engine !== 'all') qs.set('engine', engine);
  return apiFetch<SensorDataResponse>(
    `/api/vessels/${vesselId}/sensor-data?${qs.toString()}`
  );
}

// ─── Delta Deviation Trendline ────────────────────────────────────────────────

export async function fetchDeltaDeviation(
  vesselId: number,
  from: string,
  to: string,
  engine?: string
): Promise<DeltaDeviationResponse> {
  const qs = new URLSearchParams({ from, to });
  if (engine && engine !== 'all') qs.set('engine', engine);
  return apiFetch<DeltaDeviationResponse>(
    `/api/vessels/${vesselId}/condition-monitoring/delta-deviation?${qs.toString()}`
  );
}

// ─── Parameter Scatter ────────────────────────────────────────────────────────

export async function fetchParameterScatter(
  vesselId: number,
  from: string,
  to: string,
  engine?: string
): Promise<ParameterScatterResponse> {
  const qs = new URLSearchParams({ from, to });
  if (engine && engine !== 'all') qs.set('engine', engine);
  return apiFetch<ParameterScatterResponse>(
    `/api/vessels/${vesselId}/condition-monitoring/parameter-scatter?${qs.toString()}`
  );
}

// ─── SFOC Scatter ─────────────────────────────────────────────────────────────

export async function fetchSfoc(
  vesselId: number,
  from: string,
  to: string,
  engine?: string
): Promise<SfocResponse> {
  const qs = new URLSearchParams({ from, to });
  if (engine && engine !== 'all') qs.set('engine', engine);
  return apiFetch<SfocResponse>(
    `/api/vessels/${vesselId}/condition-monitoring/sfoc?${qs.toString()}`
  );
}

// ─── Fuel Consumption Rate ────────────────────────────────────────────────────

export async function fetchFuelRate(
  vesselId: number,
  from: string,
  to: string,
  engine?: string
): Promise<FuelRateResponse> {
  const qs = new URLSearchParams({ from, to });
  if (engine && engine !== 'all') qs.set('engine', engine);
  return apiFetch<FuelRateResponse>(
    `/api/vessels/${vesselId}/condition-monitoring/fuel-rate?${qs.toString()}`
  );
}

// ─── Health Scores ────────────────────────────────────────────────────────────

export async function fetchHealthScores(
  vesselId: number,
  engine?: string
): Promise<HealthScoresResponse> {
  const qs = engine && engine !== 'all' ? `?engine=${engine}` : '';
  return apiFetch<HealthScoresResponse>(
    `/api/vessels/${vesselId}/condition-monitoring/health-scores${qs}`
  );
}

// ─── Spare Parts ──────────────────────────────────────────────────────────────

export async function fetchSpareParts(
  vesselId: number,
  engine?: string
): Promise<SparePartsResponse> {
  const qs = engine && engine !== 'all' ? `?engine=${engine}` : '';
  return apiFetch<SparePartsResponse>(
    `/api/vessels/${vesselId}/condition-monitoring/spare-parts${qs}`
  );
}
