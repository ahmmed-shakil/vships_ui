/**
 * Dummy engine monitoring data — per-vessel engine data map.
 *
 * Each vessel gets its own set of engine entries, keyed by vessel ID.
 * The engine count and values differ between vessels.
 */

export interface EngineFlowMeter {
  fm_in: number;   // kg/h
  fm_cons: number; // kg/h
  fm_out: number;  // kg/h
}

export interface EngineGaugeData {
  /** Engine RPM */
  engine_rpm: number;
  /** Engine load percentage (0-100) */
  engine_load: number;
  /** Fuel consumption raw value (L/H) */
  fuel_cons: number;
}

export interface EngineTotals {
  /** Total fuel consumed (M³) */
  total_fuel: number;
  /** Running hours */
  running_hours: number;
}

export interface EngineDetailData {
  lubeoil_press: number;     // kPa
  lubeoil_temp: number;      // °C
  coolant_press: number;     // kPa
  coolant_temp: number;      // °C
  batt_volt: number;         // VDC
  exhgas_temp_left: number;  // °C
  exhgas_temp_right: number; // °C
}

export interface EngineMonitorData {
  id: string;
  label: string;
  flowMeter: EngineFlowMeter;
  gauge: EngineGaugeData;
  totals: EngineTotals;
  detail?: EngineDetailData;
}

// ─── RPM gauge config ────────────────────────────────────────────────────────

export const ENGINE_RATED_KW = 1033;
export const RPM_GAUGE_MAX = 2400;
export const FUEL_GAUGE_MAX = 350;

// ─── Helper: derive display values ──────────────────────────────────────────

/** kW = (engine_load / 100) × rated kW */
export function computeKW(engineLoad: number): number {
  return Number(((engineLoad * ENGINE_RATED_KW) / 100).toFixed(1));
}

/**
 * g/kWh = (fuel_cons × 850) / (10.33 × engine_load)
 * Returns 0 when engine_load is 0.
 */
export function computeGKWH(fuelCons: number, engineLoad: number): number {
  if (engineLoad === 0) return 0;
  return Number(((fuelCons * 850) / (10.33 * engineLoad)).toFixed(1));
}

// ─── Per-vessel engine data ──────────────────────────────────────────────────

/** Map of vessel ID → engine data array */
export const vesselEngineData: Record<number, EngineMonitorData[]> = {
  // Ocean Voyager — 3 engines
  1: [
    {
      id: 'me1', label: 'ME PORT',
      flowMeter: { fm_in: 12.5, fm_cons: 10.2, fm_out: 2.3 },
      gauge: { engine_rpm: 1167.5, engine_load: 11.52, fuel_cons: 33.5 },
      totals: { total_fuel: 66.46, running_hours: 5077.10 },
    },
    {
      id: 'me2', label: 'ME STBD',
      flowMeter: { fm_in: 11.8, fm_cons: 9.7, fm_out: 2.1 },
      gauge: { engine_rpm: 1178.2, engine_load: 11.52, fuel_cons: 13.6 },
      totals: { total_fuel: 13.61, running_hours: 7699.65 },
    },
    {
      id: 'me3', label: 'ME CENTER',
      flowMeter: { fm_in: 0.0, fm_cons: 0.0, fm_out: 0.0 },
      gauge: { engine_rpm: 0, engine_load: 0, fuel_cons: 0 },
      totals: { total_fuel: 0.0, running_hours: 7723.30 },
    },
  ],

  // Sea Explorer — 2 engines
  2: [
    {
      id: 'me1', label: 'ME PORT',
      flowMeter: { fm_in: 15.3, fm_cons: 12.8, fm_out: 2.5 },
      gauge: { engine_rpm: 1420.0, engine_load: 45.0, fuel_cons: 85.2 },
      totals: { total_fuel: 120.35, running_hours: 8210.40 },
    },
    {
      id: 'me2', label: 'ME STBD',
      flowMeter: { fm_in: 14.7, fm_cons: 12.1, fm_out: 2.6 },
      gauge: { engine_rpm: 1395.8, engine_load: 42.3, fuel_cons: 78.4 },
      totals: { total_fuel: 115.22, running_hours: 8195.70 },
    },
  ],

  // Wave Rider — 4 engines
  3: [
    {
      id: 'me1', label: 'ME PORT',
      flowMeter: { fm_in: 18.2, fm_cons: 15.0, fm_out: 3.2 },
      gauge: { engine_rpm: 1580.0, engine_load: 62.5, fuel_cons: 120.0 },
      totals: { total_fuel: 245.80, running_hours: 12400.50 },
    },
    {
      id: 'me2', label: 'ME STBD',
      flowMeter: { fm_in: 17.8, fm_cons: 14.5, fm_out: 3.3 },
      gauge: { engine_rpm: 1560.2, engine_load: 60.1, fuel_cons: 115.3 },
      totals: { total_fuel: 238.45, running_hours: 12380.20 },
    },
    {
      id: 'me3', label: 'ME CENTER',
      flowMeter: { fm_in: 16.5, fm_cons: 13.8, fm_out: 2.7 },
      gauge: { engine_rpm: 1520.5, engine_load: 55.8, fuel_cons: 105.0 },
      totals: { total_fuel: 220.10, running_hours: 11950.80 },
    },
    {
      id: 'me4', label: 'AUX 1',
      flowMeter: { fm_in: 8.5, fm_cons: 7.2, fm_out: 1.3 },
      gauge: { engine_rpm: 980.0, engine_load: 25.0, fuel_cons: 45.0 },
      totals: { total_fuel: 98.50, running_hours: 9800.00 },
    },
  ],

  // Storm Chaser — 3 engines
  4: [
    {
      id: 'me1', label: 'ME PORT',
      flowMeter: { fm_in: 10.0, fm_cons: 8.5, fm_out: 1.5 },
      gauge: { engine_rpm: 1050.0, engine_load: 30.0, fuel_cons: 52.0 },
      totals: { total_fuel: 85.30, running_hours: 6500.25 },
    },
    {
      id: 'me2', label: 'ME STBD',
      flowMeter: { fm_in: 9.8, fm_cons: 8.2, fm_out: 1.6 },
      gauge: { engine_rpm: 1040.5, engine_load: 28.5, fuel_cons: 48.5 },
      totals: { total_fuel: 82.10, running_hours: 6480.80 },
    },
    {
      id: 'me3', label: 'ME CENTER',
      flowMeter: { fm_in: 10.2, fm_cons: 8.8, fm_out: 1.4 },
      gauge: { engine_rpm: 1060.0, engine_load: 31.0, fuel_cons: 55.0 },
      totals: { total_fuel: 88.00, running_hours: 6520.10 },
    },
  ],

  // Blue Horizon — 2 engines
  5: [
    {
      id: 'me1', label: 'ME PORT',
      flowMeter: { fm_in: 20.0, fm_cons: 16.5, fm_out: 3.5 },
      gauge: { engine_rpm: 1650.0, engine_load: 72.0, fuel_cons: 145.0 },
      totals: { total_fuel: 310.50, running_hours: 15200.00 },
    },
    {
      id: 'me2', label: 'ME STBD',
      flowMeter: { fm_in: 19.5, fm_cons: 16.0, fm_out: 3.5 },
      gauge: { engine_rpm: 1630.0, engine_load: 70.5, fuel_cons: 140.0 },
      totals: { total_fuel: 305.20, running_hours: 15150.30 },
    },
  ],

  // Coral Navigator — 3 engines
  6: [
    {
      id: 'me1', label: 'ME PORT',
      flowMeter: { fm_in: 13.0, fm_cons: 10.8, fm_out: 2.2 },
      gauge: { engine_rpm: 1250.0, engine_load: 38.0, fuel_cons: 68.0 },
      totals: { total_fuel: 142.80, running_hours: 9100.50 },
    },
    {
      id: 'me2', label: 'ME STBD',
      flowMeter: { fm_in: 12.5, fm_cons: 10.3, fm_out: 2.2 },
      gauge: { engine_rpm: 1230.0, engine_load: 36.5, fuel_cons: 64.0 },
      totals: { total_fuel: 138.50, running_hours: 9050.20 },
    },
    {
      id: 'me3', label: 'ME CENTER',
      flowMeter: { fm_in: 0.0, fm_cons: 0.0, fm_out: 0.0 },
      gauge: { engine_rpm: 0, engine_load: 0, fuel_cons: 0 },
      totals: { total_fuel: 0.0, running_hours: 8800.00 },
    },
  ],

  // Aurora Spirit — 4 engines
  7: [
    {
      id: 'me1', label: 'ME PORT',
      flowMeter: { fm_in: 22.0, fm_cons: 18.5, fm_out: 3.5 },
      gauge: { engine_rpm: 1800.0, engine_load: 80.0, fuel_cons: 165.0 },
      totals: { total_fuel: 380.00, running_hours: 18500.00 },
    },
    {
      id: 'me2', label: 'ME STBD',
      flowMeter: { fm_in: 21.5, fm_cons: 18.0, fm_out: 3.5 },
      gauge: { engine_rpm: 1785.0, engine_load: 78.5, fuel_cons: 160.0 },
      totals: { total_fuel: 372.50, running_hours: 18450.00 },
    },
    {
      id: 'me3', label: 'ME CENTER',
      flowMeter: { fm_in: 20.0, fm_cons: 16.8, fm_out: 3.2 },
      gauge: { engine_rpm: 1720.0, engine_load: 75.0, fuel_cons: 150.0 },
      totals: { total_fuel: 350.00, running_hours: 18000.00 },
    },
    {
      id: 'me4', label: 'AUX 1',
      flowMeter: { fm_in: 10.0, fm_cons: 8.5, fm_out: 1.5 },
      gauge: { engine_rpm: 1100.0, engine_load: 35.0, fuel_cons: 60.0 },
      totals: { total_fuel: 150.00, running_hours: 12000.00 },
    },
  ],

  // Tide Breaker — 2 engines
  8: [
    {
      id: 'me1', label: 'ME PORT',
      flowMeter: { fm_in: 7.5, fm_cons: 6.2, fm_out: 1.3 },
      gauge: { engine_rpm: 850.0, engine_load: 18.0, fuel_cons: 32.0 },
      totals: { total_fuel: 55.00, running_hours: 4200.00 },
    },
    {
      id: 'me2', label: 'ME STBD',
      flowMeter: { fm_in: 7.2, fm_cons: 5.9, fm_out: 1.3 },
      gauge: { engine_rpm: 840.0, engine_load: 17.5, fuel_cons: 30.5 },
      totals: { total_fuel: 52.50, running_hours: 4180.00 },
    },
  ],

  // Harbor Guardian — 3 engines
  9: [
    {
      id: 'me1', label: 'ME PORT',
      flowMeter: { fm_in: 16.0, fm_cons: 13.2, fm_out: 2.8 },
      gauge: { engine_rpm: 1480.0, engine_load: 55.0, fuel_cons: 100.0 },
      totals: { total_fuel: 200.00, running_hours: 10500.00 },
    },
    {
      id: 'me2', label: 'ME STBD',
      flowMeter: { fm_in: 15.5, fm_cons: 12.8, fm_out: 2.7 },
      gauge: { engine_rpm: 1460.0, engine_load: 53.0, fuel_cons: 96.0 },
      totals: { total_fuel: 195.00, running_hours: 10450.00 },
    },
    {
      id: 'me3', label: 'ME CENTER',
      flowMeter: { fm_in: 14.8, fm_cons: 12.2, fm_out: 2.6 },
      gauge: { engine_rpm: 1430.0, engine_load: 50.0, fuel_cons: 90.0 },
      totals: { total_fuel: 185.00, running_hours: 10300.00 },
    },
  ],

  // Sea Sentinel — 2 engines
  10: [
    {
      id: 'me1', label: 'ME PORT',
      flowMeter: { fm_in: 5.0, fm_cons: 4.0, fm_out: 1.0 },
      gauge: { engine_rpm: 600.0, engine_load: 10.0, fuel_cons: 18.0 },
      totals: { total_fuel: 30.00, running_hours: 3000.00 },
    },
    {
      id: 'me2', label: 'ME STBD',
      flowMeter: { fm_in: 4.8, fm_cons: 3.8, fm_out: 1.0 },
      gauge: { engine_rpm: 580.0, engine_load: 9.5, fuel_cons: 17.0 },
      totals: { total_fuel: 28.00, running_hours: 2950.00 },
    },
  ],
};

// ─── Helper: find an engine by id within a vessel ────────────────────────────

export function findEngine(vesselId: number, engineId: string): EngineMonitorData | undefined {
  return vesselEngineData[vesselId]?.find((e) => e.id === engineId);
}

// ─── Genset (Auxiliary Engine) data per vessel ───────────────────────────────

/** Map of vessel ID → auxiliary engine data (AE1 = Genset 1, AE2 = Genset 2) */
export const vesselGensetData: Record<number, EngineMonitorData[]> = {
  // Ocean Voyager — 2 gensets
  1: [
    {
      id: 'ae1', label: 'Genset 1',
      flowMeter: { fm_in: 3.2, fm_cons: 2.8, fm_out: 0.4 },
      gauge: { engine_rpm: 720, engine_load: 35, fuel_cons: 18.5 },
      totals: { total_fuel: 0.00, running_hours: 0.000 },
    },
    {
      id: 'ae2', label: 'Genset 2',
      flowMeter: { fm_in: 3.0, fm_cons: 2.5, fm_out: 0.5 },
      gauge: { engine_rpm: 710, engine_load: 33, fuel_cons: 17.2 },
      totals: { total_fuel: 51.95, running_hours: 0.000 },
    },
  ],

  // Sea Explorer — 2 gensets
  2: [
    {
      id: 'ae1', label: 'Genset 1',
      flowMeter: { fm_in: 4.0, fm_cons: 3.5, fm_out: 0.5 },
      gauge: { engine_rpm: 750, engine_load: 40, fuel_cons: 22.0 },
      totals: { total_fuel: 38.20, running_hours: 3200.50 },
    },
    {
      id: 'ae2', label: 'Genset 2',
      flowMeter: { fm_in: 3.8, fm_cons: 3.3, fm_out: 0.5 },
      gauge: { engine_rpm: 740, engine_load: 38, fuel_cons: 20.5 },
      totals: { total_fuel: 36.00, running_hours: 3180.20 },
    },
  ],

  // Wave Rider — 1 genset only
  3: [
    {
      id: 'ae1', label: 'Genset 1',
      flowMeter: { fm_in: 5.0, fm_cons: 4.2, fm_out: 0.8 },
      gauge: { engine_rpm: 780, engine_load: 45, fuel_cons: 25.0 },
      totals: { total_fuel: 55.10, running_hours: 4500.00 },
    },
  ],

  // Storm Chaser — 2 gensets
  4: [
    {
      id: 'ae1', label: 'Genset 1',
      flowMeter: { fm_in: 2.8, fm_cons: 2.3, fm_out: 0.5 },
      gauge: { engine_rpm: 690, engine_load: 28, fuel_cons: 14.0 },
      totals: { total_fuel: 22.50, running_hours: 2100.00 },
    },
    {
      id: 'ae2', label: 'Genset 2',
      flowMeter: { fm_in: 2.6, fm_cons: 2.1, fm_out: 0.5 },
      gauge: { engine_rpm: 680, engine_load: 26, fuel_cons: 13.0 },
      totals: { total_fuel: 20.80, running_hours: 2050.00 },
    },
  ],

  // Blue Horizon — no gensets (empty)
  5: [],

  // Coral Navigator — 1 genset
  6: [
    {
      id: 'ae1', label: 'Genset 1',
      flowMeter: { fm_in: 3.5, fm_cons: 3.0, fm_out: 0.5 },
      gauge: { engine_rpm: 730, engine_load: 36, fuel_cons: 19.0 },
      totals: { total_fuel: 40.00, running_hours: 3500.00 },
    },
  ],

  // Aurora Spirit — 2 gensets
  7: [
    {
      id: 'ae1', label: 'Genset 1',
      flowMeter: { fm_in: 5.5, fm_cons: 4.8, fm_out: 0.7 },
      gauge: { engine_rpm: 800, engine_load: 50, fuel_cons: 28.0 },
      totals: { total_fuel: 65.00, running_hours: 5200.00 },
    },
    {
      id: 'ae2', label: 'Genset 2',
      flowMeter: { fm_in: 5.2, fm_cons: 4.5, fm_out: 0.7 },
      gauge: { engine_rpm: 790, engine_load: 48, fuel_cons: 26.5 },
      totals: { total_fuel: 62.00, running_hours: 5100.00 },
    },
  ],

  // Tide Breaker — no gensets
  8: [],

  // Harbor Guardian — 2 gensets
  9: [
    {
      id: 'ae1', label: 'Genset 1',
      flowMeter: { fm_in: 4.5, fm_cons: 3.8, fm_out: 0.7 },
      gauge: { engine_rpm: 760, engine_load: 42, fuel_cons: 23.0 },
      totals: { total_fuel: 48.00, running_hours: 4000.00 },
    },
    {
      id: 'ae2', label: 'Genset 2',
      flowMeter: { fm_in: 4.2, fm_cons: 3.6, fm_out: 0.6 },
      gauge: { engine_rpm: 750, engine_load: 40, fuel_cons: 21.5 },
      totals: { total_fuel: 45.00, running_hours: 3950.00 },
    },
  ],

  // Sea Sentinel — 1 genset
  10: [
    {
      id: 'ae1', label: 'Genset 1',
      flowMeter: { fm_in: 2.0, fm_cons: 1.6, fm_out: 0.4 },
      gauge: { engine_rpm: 620, engine_load: 15, fuel_cons: 10.0 },
      totals: { total_fuel: 15.00, running_hours: 1500.00 },
    },
  ],
};

// ─── Backwards-compatible export (vessel 1's data) ───────────────────────────

export const engineMonitorData: EngineMonitorData[] = vesselEngineData[1];

// ─── Per-engine detail data (lube oil, coolant, battery, exhaust) ────────────

/** Key format: "vesselId:engineId" e.g. "1:me1" */
const engineDetailMap: Record<string, EngineDetailData> = {
  // Ocean Voyager
  '1:me1': { lubeoil_press: 420, lubeoil_temp: 78,  coolant_press: 185, coolant_temp: 82, batt_volt: 24.8, exhgas_temp_left: 340, exhgas_temp_right: 345 },
  '1:me2': { lubeoil_press: 410, lubeoil_temp: 76,  coolant_press: 180, coolant_temp: 80, batt_volt: 24.6, exhgas_temp_left: 335, exhgas_temp_right: 340 },
  '1:me3': { lubeoil_press: 0,   lubeoil_temp: 0,   coolant_press: 0,   coolant_temp: 0,  batt_volt: 24.2, exhgas_temp_left: 0,   exhgas_temp_right: 0 },
  '1:ae1': { lubeoil_press: 350, lubeoil_temp: 65,  coolant_press: 160, coolant_temp: 72, batt_volt: 24.5, exhgas_temp_left: 280, exhgas_temp_right: 285 },
  '1:ae2': { lubeoil_press: 340, lubeoil_temp: 63,  coolant_press: 155, coolant_temp: 70, batt_volt: 24.4, exhgas_temp_left: 275, exhgas_temp_right: 280 },

  // Sea Explorer
  '2:me1': { lubeoil_press: 480, lubeoil_temp: 85,  coolant_press: 200, coolant_temp: 88, batt_volt: 25.0, exhgas_temp_left: 380, exhgas_temp_right: 385 },
  '2:me2': { lubeoil_press: 465, lubeoil_temp: 83,  coolant_press: 195, coolant_temp: 86, batt_volt: 24.9, exhgas_temp_left: 375, exhgas_temp_right: 378 },
  '2:ae1': { lubeoil_press: 360, lubeoil_temp: 68,  coolant_press: 165, coolant_temp: 74, batt_volt: 24.7, exhgas_temp_left: 290, exhgas_temp_right: 292 },
  '2:ae2': { lubeoil_press: 355, lubeoil_temp: 66,  coolant_press: 162, coolant_temp: 73, batt_volt: 24.6, exhgas_temp_left: 288, exhgas_temp_right: 290 },

  // Wave Rider
  '3:me1': { lubeoil_press: 520, lubeoil_temp: 92,  coolant_press: 220, coolant_temp: 94, batt_volt: 25.2, exhgas_temp_left: 410, exhgas_temp_right: 415 },
  '3:me2': { lubeoil_press: 510, lubeoil_temp: 90,  coolant_press: 215, coolant_temp: 92, batt_volt: 25.1, exhgas_temp_left: 405, exhgas_temp_right: 408 },
  '3:me3': { lubeoil_press: 500, lubeoil_temp: 88,  coolant_press: 210, coolant_temp: 90, batt_volt: 25.0, exhgas_temp_left: 400, exhgas_temp_right: 403 },
  '3:ae1': { lubeoil_press: 380, lubeoil_temp: 72,  coolant_press: 175, coolant_temp: 78, batt_volt: 24.8, exhgas_temp_left: 310, exhgas_temp_right: 315 },

  // Storm Chaser
  '4:me1': { lubeoil_press: 400, lubeoil_temp: 74,  coolant_press: 178, coolant_temp: 79, batt_volt: 24.5, exhgas_temp_left: 320, exhgas_temp_right: 325 },
  '4:me2': { lubeoil_press: 395, lubeoil_temp: 72,  coolant_press: 175, coolant_temp: 77, batt_volt: 24.4, exhgas_temp_left: 315, exhgas_temp_right: 320 },
  '4:me3': { lubeoil_press: 405, lubeoil_temp: 75,  coolant_press: 180, coolant_temp: 80, batt_volt: 24.6, exhgas_temp_left: 322, exhgas_temp_right: 328 },
  '4:ae1': { lubeoil_press: 330, lubeoil_temp: 60,  coolant_press: 150, coolant_temp: 68, batt_volt: 24.3, exhgas_temp_left: 265, exhgas_temp_right: 268 },
  '4:ae2': { lubeoil_press: 325, lubeoil_temp: 58,  coolant_press: 148, coolant_temp: 66, batt_volt: 24.2, exhgas_temp_left: 260, exhgas_temp_right: 265 },

  // Blue Horizon
  '5:me1': { lubeoil_press: 550, lubeoil_temp: 96,  coolant_press: 230, coolant_temp: 98, batt_volt: 25.5, exhgas_temp_left: 430, exhgas_temp_right: 435 },
  '5:me2': { lubeoil_press: 540, lubeoil_temp: 94,  coolant_press: 225, coolant_temp: 96, batt_volt: 25.4, exhgas_temp_left: 425, exhgas_temp_right: 430 },

  // Coral Navigator
  '6:me1': { lubeoil_press: 450, lubeoil_temp: 80,  coolant_press: 190, coolant_temp: 84, batt_volt: 24.8, exhgas_temp_left: 350, exhgas_temp_right: 355 },
  '6:me2': { lubeoil_press: 440, lubeoil_temp: 78,  coolant_press: 185, coolant_temp: 82, batt_volt: 24.7, exhgas_temp_left: 345, exhgas_temp_right: 350 },
  '6:me3': { lubeoil_press: 0,   lubeoil_temp: 0,   coolant_press: 0,   coolant_temp: 0,  batt_volt: 24.5, exhgas_temp_left: 0,   exhgas_temp_right: 0 },
  '6:ae1': { lubeoil_press: 355, lubeoil_temp: 65,  coolant_press: 162, coolant_temp: 72, batt_volt: 24.5, exhgas_temp_left: 285, exhgas_temp_right: 288 },

  // Aurora Spirit
  '7:me1': { lubeoil_press: 580, lubeoil_temp: 100, coolant_press: 240, coolant_temp: 102, batt_volt: 25.8, exhgas_temp_left: 450, exhgas_temp_right: 455 },
  '7:me2': { lubeoil_press: 570, lubeoil_temp: 98,  coolant_press: 235, coolant_temp: 100, batt_volt: 25.7, exhgas_temp_left: 445, exhgas_temp_right: 450 },
  '7:me3': { lubeoil_press: 555, lubeoil_temp: 95,  coolant_press: 228, coolant_temp: 97,  batt_volt: 25.5, exhgas_temp_left: 435, exhgas_temp_right: 440 },
  '7:ae1': { lubeoil_press: 400, lubeoil_temp: 75,  coolant_press: 180, coolant_temp: 80,  batt_volt: 25.0, exhgas_temp_left: 330, exhgas_temp_right: 335 },
  '7:ae2': { lubeoil_press: 395, lubeoil_temp: 73,  coolant_press: 178, coolant_temp: 78,  batt_volt: 24.9, exhgas_temp_left: 325, exhgas_temp_right: 330 },

  // Tide Breaker
  '8:me1': { lubeoil_press: 380, lubeoil_temp: 70,  coolant_press: 170, coolant_temp: 75, batt_volt: 24.3, exhgas_temp_left: 300, exhgas_temp_right: 305 },
  '8:me2': { lubeoil_press: 375, lubeoil_temp: 68,  coolant_press: 168, coolant_temp: 73, batt_volt: 24.2, exhgas_temp_left: 295, exhgas_temp_right: 300 },

  // Harbor Guardian
  '9:me1': { lubeoil_press: 500, lubeoil_temp: 88,  coolant_press: 210, coolant_temp: 90, batt_volt: 25.0, exhgas_temp_left: 395, exhgas_temp_right: 400 },
  '9:me2': { lubeoil_press: 490, lubeoil_temp: 86,  coolant_press: 205, coolant_temp: 88, batt_volt: 24.9, exhgas_temp_left: 390, exhgas_temp_right: 395 },
  '9:me3': { lubeoil_press: 480, lubeoil_temp: 84,  coolant_press: 200, coolant_temp: 86, batt_volt: 24.8, exhgas_temp_left: 385, exhgas_temp_right: 388 },
  '9:ae1': { lubeoil_press: 370, lubeoil_temp: 70,  coolant_press: 170, coolant_temp: 76, batt_volt: 24.6, exhgas_temp_left: 300, exhgas_temp_right: 305 },
  '9:ae2': { lubeoil_press: 365, lubeoil_temp: 68,  coolant_press: 168, coolant_temp: 74, batt_volt: 24.5, exhgas_temp_left: 295, exhgas_temp_right: 300 },

  // Sea Sentinel
  '10:me1': { lubeoil_press: 350, lubeoil_temp: 62,  coolant_press: 155, coolant_temp: 68, batt_volt: 24.0, exhgas_temp_left: 270, exhgas_temp_right: 275 },
  '10:me2': { lubeoil_press: 345, lubeoil_temp: 60,  coolant_press: 152, coolant_temp: 66, batt_volt: 23.9, exhgas_temp_left: 265, exhgas_temp_right: 270 },
  '10:ae1': { lubeoil_press: 300, lubeoil_temp: 55,  coolant_press: 140, coolant_temp: 62, batt_volt: 23.8, exhgas_temp_left: 240, exhgas_temp_right: 245 },
};

/** Find an engine and merge detail data onto it */
export function findEngineWithDetail(vesselId: number, engineId: string): EngineMonitorData | undefined {
  const engine =
    vesselEngineData[vesselId]?.find((e) => e.id === engineId) ??
    vesselGensetData[vesselId]?.find((e) => e.id === engineId);
  if (!engine) return undefined;
  const detail = engineDetailMap[`${vesselId}:${engineId}`];
  return detail ? { ...engine, detail } : engine;
}

/** Get all engines + gensets for a vessel (with detail merged) */
export function getAllEnginesForVessel(vesselId: number): EngineMonitorData[] {
  const mains = vesselEngineData[vesselId] ?? [];
  const gensets = vesselGensetData[vesselId] ?? [];
  return [...mains, ...gensets].map((e) => {
    const detail = engineDetailMap[`${vesselId}:${e.id}`];
    return detail ? { ...e, detail } : e;
  });
}

