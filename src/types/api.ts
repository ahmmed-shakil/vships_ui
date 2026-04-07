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
  lt_coolant_press: number;
  fuel_oil_press: number;
  fuel_oil_temp?: number;
  start_air_press: number;
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
  eg_temp_9: number | null;
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
  asset_id: string;
  device_id: number;
  rpm: number | null;
  tc_rpm: number | null;
  fpi: number | null;
  eg_temp_1: number | null;
  eg_temp_2: number | null;
  eg_temp_3: number | null;
  eg_temp_4: number | null;
  eg_temp_5: number | null;
  eg_temp_6: number | null;
  eg_temp_7: number | null;
  eg_temp_8: number | null;
  eg_temp_9: number | null;
  eg_temp_mean: number | null;
  max_eg_temp_mean: number | null;
  eg_temp_compensator: number | null;
  eg_temp_out_turbo: number | null;
  eg_temp_tc_in: number | null;
  eg_temp_tc_out: number | null;
  eg_temp_dev_1: number | null;
  eg_temp_dev_2: number | null;
  eg_temp_dev_3: number | null;
  eg_temp_dev_4: number | null;
  eg_temp_dev_5: number | null;
  eg_temp_dev_6: number | null;
  eg_temp_dev_7: number | null;
  eg_temp_dev_8: number | null;
  exh_gas_limit: number | null;
  exh_gas_temp: number | null;
  exhaust_gas_temp_diff: number | null;
  fo_press_inlet: number | null;
  fo_press_filter_in: number | null;
  fo_temp_in: number | null;
  fo_flow_inlet: number | null;
  fo_flow_outlet: number | null;
  lo_press: number | null;
  lo_press_in: number | null;
  lo_press_filter_in: number | null;
  lo_press_tc: number | null;
  lo_temp: number | null;
  lo_temp_in: number | null;
  lo_tc_temp: number | null;
  ht_cw_press: number | null;
  ht_cw_temp: number | null;
  ht_cw_inlet_temp: number | null;
  ht_cw_temp_out: number | null;
  lt_cw_press: number | null;
  lt_cw_temp: number | null;
  lt_cw_temp_in: number | null;
  startair_press: number | null;
  startair_temp_out: number | null;
  chargeair_press: number | null;
  chargeair_temp: number | null;
  chargeair_press_ac_out: number | null;
  chargeair_temp_ac_out: number | null;
  air_temp: number | null;
  rh: number | null;
  gen_voltage: number | null;
  gen_freq: number | null;
  bus_voltage: number | null;
  bus_freq: number | null;
  phase_diff: number | null;
  cos_phi: number | null;
  load_kw: number | null;
  kva: number | null;
  kvar: number | null;
  i_u: number | null;
  i_v: number | null;
  i_w: number | null;
  v_uv: number | null;
  v_vw: number | null;
  v_uw: number | null;
  wind_u_temp_diff: number | null;
  wind_v_temp_diff: number | null;
  wind_w_temp_diff: number | null;
  fo_srv_tk17_ps: number | null;
  fo_srv_tk17_sb: number | null;
  fo_tk3_ps: number | null;
  fo_tk3_sb: number | null;
  fo_tk5_ps: number | null;
  fo_tk5_sb: number | null;
  fo_tk6_ps: number | null;
  fo_tk6_sb: number | null;
  fo_tk7_ps: number | null;
  fo_tk7_sb: number | null;
  fo_tk8_ps: number | null;
  fo_tk8_sb: number | null;
  pw_flow: number | null;
  cargo_fo_flow: number | null;
  thrust_current: number | null;
  thrust_servo_press: number | null;
  cpp_servo_press: number | null;
  gearbox_servo_temp: number | null;
  gearbox_servo_press: number | null;
  d_bear_temp: number | null;
  n_bear_temp: number | null;
  nu: number | null;
  standby_sequence: number | null;
  sample_count: number | null;
  fuel_consumption: number | null;
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

// ─── Latest Sensor Values API ────────────────────────────────────────────────

export interface LatestSensorDataPoint {
  timestamp: string;
  asset_id: string;
  device_id: number;
  rpm: number | null;
  max_rpm: number | null;
  min_rpm: number | null;
  tc_rpm: number | null;
  fpi: number | null;
  eg_temp_1: number | null;
  eg_temp_2: number | null;
  eg_temp_3: number | null;
  eg_temp_4: number | null;
  eg_temp_5: number | null;
  eg_temp_6: number | null;
  eg_temp_7: number | null;
  eg_temp_8: number | null;
  eg_temp_9: number | null;
  eg_temp_mean: number | null;
  max_eg_temp_mean: number | null;
  eg_temp_compensator: number | null;
  eg_temp_out_turbo: number | null;
  eg_temp_tc_in: number | null;
  eg_temp_tc_out: number | null;
  exh_gas_limit: number | null;
  exh_gas_temp: number | null;
  exhaust_gas_temp_diff: number | null;
  fo_press_inlet: number | null;
  fo_press_filter_in: number | null;
  fo_temp_in: number | null;
  fo_flow_inlet: number | null;
  fo_flow_outlet: number | null;
  lo_press: number | null;
  lo_press_in: number | null;
  lo_press_filter_in: number | null;
  lo_press_tc: number | null;
  lo_temp: number | null;
  lo_temp_in: number | null;
  lo_tc_temp: number | null;
  ht_cw_press: number | null;
  ht_cw_temp: number | null;
  ht_cw_inlet_temp: number | null;
  ht_cw_temp_out: number | null;
  lt_cw_press: number | null;
  lt_cw_temp: number | null;
  lt_cw_temp_in: number | null;
  startair_press: number | null;
  startair_temp_out: number | null;
  chargeair_press: number | null;
  chargeair_temp: number | null;
  chargeair_press_ac_out: number | null;
  chargeair_temp_ac_out: number | null;
  air_temp: number | null;
  rh: number | null;
  gen_voltage: number | null;
  gen_freq: number | null;
  bus_voltage: number | null;
  bus_freq: number | null;
  phase_diff: number | null;
  cos_phi: number | null;
  load_kw: number | null;
  kva: number | null;
  kvar: number | null;
  i_u: number | null;
  i_v: number | null;
  i_w: number | null;
  v_uv: number | null;
  v_vw: number | null;
  v_uw: number | null;
  wind_u_temp_diff: number | null;
  wind_v_temp_diff: number | null;
  wind_w_temp_diff: number | null;
  pw_flow: number | null;
  cargo_fo_flow: number | null;
  thrust_current: number | null;
  thrust_servo_press: number | null;
  cpp_servo_press: number | null;
  gearbox_servo_temp: number | null;
  gearbox_servo_press: number | null;
  d_bear_temp: number | null;
  n_bear_temp: number | null;
  nu: number | null;
  standby_sequence: number | null;
  [key: string]: string | number | null;
}

export interface LatestSensorDataResponse {
  vessel: { id: number; name: string };
  count: number;
  data: LatestSensorDataPoint[];
}
