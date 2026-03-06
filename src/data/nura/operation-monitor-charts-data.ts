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

const HOURS = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
];

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
  engineCount: number
): EngineConsumptionPoint[] {
  const data: EngineConsumptionPoint[] = [];
  const engineKeys = ['me1', 'me2', 'me3', 'me4'].slice(0, engineCount);
  const baseCons = getEngineFuelCons(vesselId, engineKeys);

  // Generate variation multipliers (seeded for stability)
  const variations = seededValues(vesselId * 500, HOURS.length, 0.85, 1.15);

  HOURS.forEach((time, i) => {
    const point: EngineConsumptionPoint = { time };
    const isLast = i === HOURS.length - 1;

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
  engineCount: number
): ConsumptionSpeedPoint[] {
  const data: ConsumptionSpeedPoint[] = [];
  const engineKeys = ['me1', 'me2', 'me3', 'me4'].slice(0, engineCount);
  const baseCons = getEngineFuelCons(vesselId, engineKeys);
  const speedValues = seededValues(vesselId * 7777, HOURS.length, 8, 18);
  const variations = seededValues(vesselId * 600, HOURS.length, 0.8, 1.2);

  HOURS.forEach((time, i) => {
    const point: ConsumptionSpeedPoint = { time, speed: speedValues[i] };
    const isLast = i === HOURS.length - 1;

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
    });
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
  return {
    consumption: generateConsumption(vesselId, engineCount),
    consumptionVsSpeed: generateConsumptionVsSpeed(vesselId, engineCount),
  };
}
