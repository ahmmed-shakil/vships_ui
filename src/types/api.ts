// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user: ApiUser;
  accessToken: string;
  refreshToken: string;
  error?: string;
}

export interface ApiUser {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
}

// ─── Vessels ──────────────────────────────────────────────────────────────────

export interface ShipPosition {
  lat: number;
  long: number;
  direction: number;
  timestamp: number; // Unix seconds
}

export interface Ship {
  id: number;
  label: string;
  value: string;
  engines: string[];
  position: ShipPosition;
}

export interface FleetVessel {
  vessel_id: number;
  name: string;
  position: {
    lat: number;
    long: number;
    direction: number;
    timestamp: number;
  };
  position_status: string;
  online: number;
  me1: number;
  me2: number;
  me3: number;
  ae1: number;
  ae2: number;
}

// ─── Engines ──────────────────────────────────────────────────────────────────

export interface EngineOption {
  label: string;
  value: string;
}

export interface EngineFlowMeter {
  fm_in: number;
  fm_cons: number;
  fm_out: number;
}

export interface EngineGaugeData {
  engine_rpm: number;
  engine_load: number;
  fuel_cons: number;
}

export interface EngineTotals {
  total_fuel: number;
  running_hours: number;
}

export interface EngineDetailData {
  lubeoil_press: number;
  lubeoil_temp: number;
  coolant_press: number;
  coolant_temp: number;
  batt_volt: number;
  exhgas_temp_left: number;
  exhgas_temp_right: number;
}

export interface EngineMonitorData {
  id: string;
  label: string;
  flowMeter: EngineFlowMeter;
  gauge: EngineGaugeData;
  totals: EngineTotals;
  detail?: EngineDetailData | null;
}

export interface VesselEnginesResponse {
  vessel_id: number;
  main_engines: EngineMonitorData[];
  gensets: EngineMonitorData[];
}

// ─── Alarms ───────────────────────────────────────────────────────────────────

export type AlarmCategory = 'critical' | 'warning' | 'notice' | 'info';

export interface AlarmEntry {
  id: string;
  timestamp: number;
  alarm_text: string;
  engine: string;
  value: number | null;
  threshold_min: number | null;
  threshold_max: number | null;
  severity: 1 | 2;
  status: 'active' | 'resolved';
  category: AlarmCategory;
}

// ─── Charts ───────────────────────────────────────────────────────────────────

export interface ConsumptionSpeedPoint {
  time: string;
  speed: number;
  [engine: string]: number | string;
}

export interface EngineConsumptionPoint {
  time: string;
  [engine: string]: number | string;
}

// ─── Emission Zones ───────────────────────────────────────────────────────────

export interface EmissionZone {
  id: string;
  name: string;
  positions: [number, number][];
  options: {
    color: string;
    fillColor: string;
    fillOpacity: number;
    weight: number;
  };
}

// ─── Machinery Scores ─────────────────────────────────────────────────────────

export interface MachineryScoreEntry {
  id: string;
  name: string;
  value: string;
  status: 'active' | 'inactive';
}

// ─── Notifications ────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  name: string;
  icon: string;
  unRead: boolean;
  sendTime: string;
}

// ─── Machinery Overview ───────────────────────────────────────────────────────

export interface EngineOverviewMetrics {
  rpm: number | null;
  exhaust_temp: number | null;
  oil_pressure: number | null;
  oil_temp: number | null;
  coolant_temp: number | null;
  fuel_consumption: number | null;
}

export interface EngineOverviewAlarms {
  critical: number;
  warning: number;
  notice: number;
  info: number;
}

export interface EngineOverviewSparklines {
  rpm: number[];
  exhaust_temp: number[];
  oil_pressure: number[];
  oil_temp: number[];
  coolant_temp: number[];
  fuel_consumption: number[];
}

export interface EngineOverviewCard {
  engine_id: string;
  label: string;
  health_score: number;
  status: 'running' | 'standby' | 'off';
  metrics: EngineOverviewMetrics;
  alarms: EngineOverviewAlarms;
  sparklines: EngineOverviewSparklines;
}

// ─── Sensor Data (Condition Monitoring) ───────────────────────────────────────

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

export interface SensorDataResponse {
  count: number;
  from: string;
  to: string;
  resolution: string;
  vessel: { id: number; name: string };
  data: SensorDataPoint[];
}

// ─── Delta Deviation ──────────────────────────────────────────────────────────

export interface DeltaDeviationPoint {
  timestamp: string;
  charge_air_temp: number;
  lube_oil_temp: number;
  exh_temp: number;
  ht_cooling_water_temp: number;
  fuel_oil_pressure: number;
  lube_oil_pressure: number;
  charge_air_pressure: number;
}

export interface DeltaDeviationResponse {
  data: DeltaDeviationPoint[];
  reference_band: { upper: number; lower: number };
}

// ─── Parameter Scatter ────────────────────────────────────────────────────────

export interface ParameterScatterPoint {
  timestamp: string;
  fuel_consumption: number;
  engine_rpm: number;
  engine_load: number;
  exhaust_temp: number;
  lube_oil_pressure: number;
  coolant_temp: number;
  charge_air_pressure: number;
}

export interface ParameterScatterResponse {
  data: ParameterScatterPoint[];
  operating_modes: { normal: number[]; abnormal: number[] };
}

// ─── SFOC Scatter ─────────────────────────────────────────────────────────────

export interface SfocMode {
  mode: string;
  color: string;
  shape: string;
  data: { x: number; y: number }[];
}

export interface SfocResponse {
  modes: SfocMode[];
}

// ─── Fuel Rate ────────────────────────────────────────────────────────────────

export interface FuelRatePoint {
  timestamp: string;
  fuel_cons_rate: number;
  within_range: boolean;
}

export interface FuelRateResponse {
  data: FuelRatePoint[];
  limits: { upper: number; lower: number };
}

// ─── Health Scores ────────────────────────────────────────────────────────────

export interface HealthScoreEntry {
  parameter: string;
  label: string;
  score: number;
  delta: number;
  alarm_count: number;
  peak_value: number;
  peak_unit: string;
}

export interface HealthScoresResponse {
  scores: HealthScoreEntry[];
}

// ─── Spare Parts ──────────────────────────────────────────────────────────────

export interface SparePartEntry {
  id: string;
  spare: string;
  design_life_hrs: number;
  effective_life: number;
  hours_since_oh: number;
  remaining_life: number;
  condition: number;
  pms_link: string;
  status: 'critical' | 'urgent' | 'caution' | 'ok';
  remarks: string;
}

export interface SparePartsResponse {
  parts: SparePartEntry[];
}

// ─── Alarms with Summary ──────────────────────────────────────────────────────

export interface AlarmWithUnit extends AlarmEntry {
  unit: string;
}

export interface AlarmSummary {
  critical: number;
  warning: number;
  notice: number;
  info: number;
  active: number;
  resolved: number;
  total: number;
}

export interface AlarmsWithSummaryResponse {
  alarms: AlarmWithUnit[];
  summary: AlarmSummary;
}
