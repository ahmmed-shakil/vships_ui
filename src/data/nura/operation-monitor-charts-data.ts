/**
 * Per-vessel chart demo data for the operation-monitor page.
 *
 * Two datasets per vessel:
 * 1. Engine consumption over time (bar chart)
 * 2. Consumption vs speed over time (composed chart)
 *
 * The last data point for each engine matches the gauge fuel_cons value
 * from engine-data.ts so gauges and charts stay consistent.
 * ME CENTER (me3) is always 0 (engine off).
 * ME PORT (me1) and ME STBD (me2) track closely.
 */

import { vesselEngineData } from './engine-data';

export interface EngineConsumptionPoint {
  time: string;
  [engine: string]: number | string; // me1, me2, me3, me4
}

export interface ConsumptionSpeedPoint {
  time: string;
  speed: number; // knots
  [engine: string]: number | string; // me1, me2, me3, me4
}

export interface VesselChartData {
  consumption: EngineConsumptionPoint[];
  consumptionVsSpeed: ConsumptionSpeedPoint[];
}

// ─── Seeded random to keep values stable across renders ──────────────────────

function seededValues(
  seed: number,
  count: number,
  min: number,
  max: number
): number[] {
  const values: number[] = [];
  let s = seed;
  for (let i = 0; i < count; i++) {
    s = (s * 16807 + 12345) % 2147483647;
    values.push(Number((min + (s / 2147483647) * (max - min)).toFixed(1)));
  }
  return values;
}

const ALL_HOURS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
];

/**
 * Filter hours to only include those ≤ the current Singapore time (UTC+8).
 * This ensures charts don't show "future" data points during demos.
 */
function getFilteredHours(): string[] {
  const now = new Date();
  // Get current hour in Singapore timezone (UTC+8)
  const sgtHour = new Date(
    now.toLocaleString('en-US', { timeZone: 'Asia/Singapore' })
  ).getHours();
  const currentTimeStr = `${String(sgtHour).padStart(2, '0')}:00`;
  return ALL_HOURS.filter((h) => h <= currentTimeStr);
}

/** Get the gauge fuel_cons for each engine of a vessel (0 for missing / off engines) */
function getEngineFuelCons(
  vesselId: number,
  engineKeys: string[]
): Record<string, number> {
  const engines = vesselEngineData[vesselId] ?? [];
  const result: Record<string, number> = {};
  engineKeys.forEach((key) => {
    const eng = engines.find((e) => e.id === key);
    result[key] = eng?.gauge.fuel_cons ?? 0;
  });
  return result;
}

function generateConsumption(
  vesselId: number,
  engineCount: number,
  hours: string[]
): EngineConsumptionPoint[] {
  const data: EngineConsumptionPoint[] = [];
  const engineKeys = ['me1', 'me2', 'me3', 'me4'].slice(0, engineCount);
  const baseCons = getEngineFuelCons(vesselId, engineKeys);

  // Generate variation multipliers (seeded for stability)
  const variations = seededValues(vesselId * 500, hours.length, 0.85, 1.15);

  hours.forEach((time, i) => {
    const point: EngineConsumptionPoint = { time };
    const isLast = i === hours.length - 1;

    engineKeys.forEach((key) => {
      const base = baseCons[key];
      if (base === 0) {
        point[key] = 0;
      } else if (isLast) {
        // Last point matches gauge value exactly
        point[key] = Number(base.toFixed(1));
      } else {
        // Vary around the base; me2 gets a tiny offset so it tracks me1 closely
        const offset = key === 'me2' ? 0.02 : key === 'me4' ? -0.05 : 0;
        point[key] = Number((base * (variations[i] + offset)).toFixed(1));
      }
    });
    data.push(point);
  });

  return data;
}

function generateConsumptionVsSpeed(
  vesselId: number,
  engineCount: number,
  hours: string[]
): ConsumptionSpeedPoint[] {
  const data: ConsumptionSpeedPoint[] = [];
  const engineKeys = ['me1', 'me2', 'me3', 'me4'].slice(0, engineCount);
  const baseCons = getEngineFuelCons(vesselId, engineKeys);
  const variations = seededValues(vesselId * 600, hours.length, 0.8, 1.2);
  const noise = seededValues(vesselId * 8888, hours.length, -0.8, 0.8);

  // Realistic speed constraints (knots)
  const MIN_SPEED = 2;
  const MAX_SPEED = 20;

  // Total base consumption across all engines (for normalising)
  const totalBaseCons = engineKeys.reduce(
    (sum, key) => sum + (baseCons[key] ?? 0),
    0
  );

  hours.forEach((time, i) => {
    const isLast = i === hours.length - 1;

    // Build engine consumption values first
    const point: ConsumptionSpeedPoint = { time, speed: 0 };
    let totalCons = 0;

    engineKeys.forEach((key) => {
      const base = baseCons[key];
      if (base === 0) {
        point[key] = 0;
      } else if (isLast) {
        point[key] = Number(base.toFixed(1));
      } else {
        const offset = key === 'me2' ? 0.02 : key === 'me4' ? -0.05 : 0;
        point[key] = Number((base * (variations[i] + offset)).toFixed(1));
      }
      totalCons += Number(point[key]);
    });

    // Derive speed from total consumption ratio + noise
    // speed ≈ MIN + (MAX - MIN) × (totalCons / maxPossibleCons) + noise
    const maxPossibleCons = totalBaseCons * 1.2 || 1; // avoid division by zero
    const ratio = Math.min(totalCons / maxPossibleCons, 1);
    const rawSpeed = MIN_SPEED + (MAX_SPEED - MIN_SPEED) * ratio + noise[i];
    point.speed = Number(
      Math.max(MIN_SPEED, Math.min(MAX_SPEED, rawSpeed)).toFixed(1)
    );

    data.push(point);
  });

  return data;
}

// ─── Engine-count lookup (matches ships.ts) ──────────────────────────────────

const vesselEngineCounts: Record<number, number> = {
  1: 3,
  2: 2,
  3: 4,
  4: 3,
  5: 2,
  6: 3,
  7: 4,
  8: 2,
  9: 3,
  10: 2,
};

// ─── Public API ──────────────────────────────────────────────────────────────

export function getChartData(vesselId: number): VesselChartData {
  const engineCount = vesselEngineCounts[vesselId] ?? 3;
  const hours = getFilteredHours();
  return {
    consumption: generateConsumption(vesselId, engineCount, hours),
    consumptionVsSpeed: generateConsumptionVsSpeed(vesselId, engineCount, hours),
  };
}
