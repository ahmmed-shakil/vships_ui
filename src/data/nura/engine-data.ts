/**
 * Dummy engine monitoring data — mirrors the data shape from the old
 * perfomax-maintenance-ui project's real-time engine API responses.
 *
 * Each engine entry corresponds to a main engine (ME PORT, ME CENTER, ME STBD)
 * and contains flow-meter readings, gauge values, and running totals.
 */

export interface EngineFlowMeter {
  fm_in: number;   // kg/h
  fm_cons: number; // kg/h
  fm_out: number;  // kg/h
}

export interface EngineGaugeData {
  /** Engine RPM — drives the RPM gauge */
  engine_rpm: number;
  /** Engine load percentage (0-100) — used to compute kW */
  engine_load: number;
  /** Fuel consumption raw value — drives the fuel gauge pointer */
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

/** Max rated power in kW — used to derive kW from load % */
export const ENGINE_RATED_KW = 1033;

/** RPM gauge scale */
export const RPM_GAUGE_MAX = 2400;

/** Fuel gauge scale */
export const FUEL_GAUGE_MAX = 350;

// ─── Helper: derive display values ──────────────────────────────────────────

/** kW = (engine_load / 100) × rated kW */
export function computeKW(engineLoad: number): number {
  return Number(((engineLoad * ENGINE_RATED_KW) / 100).toFixed(1));
}

/**
 * g/kWh = (fuel_cons × 850) / (10.33 × engine_load)
 * Returns 0 when engine_load is 0 to avoid division by zero.
 */
export function computeGKWH(fuelCons: number, engineLoad: number): number {
  if (engineLoad === 0) return 0;
  return Number(((fuelCons * 850) / (10.33 * engineLoad)).toFixed(1));
}

// ─── Dummy data (matches first screenshot values) ────────────────────────────

export const engineMonitorData: EngineMonitorData[] = [
  {
    id: 'me1',
    label: 'ME PORT',
    flowMeter: {
      fm_in: 0.0,
      fm_cons: 0.0,
      fm_out: 0.0,
    },
    gauge: {
      engine_rpm: 1167.5,
      engine_load: 11.52,  // → ~119.0 kW
      fuel_cons: 33.5,
    },
    totals: {
      total_fuel: 66.46,
      running_hours: 5077.10,
    },
  },
  {
    id: 'me2',
    label: 'ME CENTER',
    flowMeter: {
      fm_in: 0.0,
      fm_cons: 0.0,
      fm_out: 0.0,
    },
    gauge: {
      engine_rpm: 0,
      engine_load: 0,
      fuel_cons: 0,
    },
    totals: {
      total_fuel: 0.0,
      running_hours: 7723.30,
    },
  },
  {
    id: 'me3',
    label: 'ME STBD',
    flowMeter: {
      fm_in: 0.0,
      fm_cons: 0.0,
      fm_out: 0.0,
    },
    gauge: {
      engine_rpm: 1178.2,
      engine_load: 11.52,  // → ~119.0 kW
      fuel_cons: 13.6,
    },
    totals: {
      total_fuel: 13.61,
      running_hours: 7699.65,
    },
  },
  {
    id: 'me4',
    label: 'ME STBD',
    flowMeter: {
      fm_in: 0.0,
      fm_cons: 0.0,
      fm_out: 0.0,
    },
    gauge: {
      engine_rpm: 1178.2,
      engine_load: 11.52,  // → ~119.0 kW
      fuel_cons: 13.6,
    },
    totals: {
      total_fuel: 13.61,
      running_hours: 7699.65,
    },
  },
  {
    id: 'me5',
    label: 'ME STBD',
    flowMeter: {
      fm_in: 0.0,
      fm_cons: 0.0,
      fm_out: 0.0,
    },
    gauge: {
      engine_rpm: 1178.2,
      engine_load: 11.52,  // → ~119.0 kW
      fuel_cons: 13.6,
    },
    totals: {
      total_fuel: 13.61,
      running_hours: 7699.65,
    },
  },
];
