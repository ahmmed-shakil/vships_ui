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

export interface EngineMonitorData {
  id: string;
  label: string;
  flowMeter: EngineFlowMeter;
  gauge: EngineGaugeData;
  totals: EngineTotals;
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
      id: 'me4', label: 'ME AUX',
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
      id: 'me4', label: 'ME AUX',
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

// ─── Backwards-compatible export (vessel 1's data) ───────────────────────────

export const engineMonitorData: EngineMonitorData[] = vesselEngineData[1];
