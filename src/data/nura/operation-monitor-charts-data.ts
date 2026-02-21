/**
 * Per-vessel chart demo data for the operation-monitor page.
 *
 * Two datasets per vessel:
 * 1. Engine consumption over time (bar chart)
 * 2. Consumption vs speed over time (composed chart)
 */

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

function seededValues(seed: number, count: number, min: number, max: number): number[] {
  const values: number[] = [];
  let s = seed;
  for (let i = 0; i < count; i++) {
    s = (s * 16807 + 12345) % 2147483647;
    values.push(Number((min + (s / 2147483647) * (max - min)).toFixed(1)));
  }
  return values;
}

const HOURS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
];

function generateConsumption(vesselId: number, engineCount: number): EngineConsumptionPoint[] {
  const data: EngineConsumptionPoint[] = [];
  const engineKeys = ['me1', 'me2', 'me3', 'me4'].slice(0, engineCount);

  const valueArrays: Record<string, number[]> = {};
  engineKeys.forEach((key, idx) => {
    const baseSeed = vesselId * 1000 + idx * 100;
    const base = 30 + idx * 10;
    valueArrays[key] = seededValues(baseSeed, HOURS.length, base, base + 80);
  });

  HOURS.forEach((time, i) => {
    const point: EngineConsumptionPoint = { time };
    engineKeys.forEach((key) => {
      point[key] = valueArrays[key][i];
    });
    data.push(point);
  });

  return data;
}

function generateConsumptionVsSpeed(vesselId: number, engineCount: number): ConsumptionSpeedPoint[] {
  const data: ConsumptionSpeedPoint[] = [];
  const engineKeys = ['me1', 'me2', 'me3', 'me4'].slice(0, engineCount);
  const speedValues = seededValues(vesselId * 7777, HOURS.length, 8, 18);

  const valueArrays: Record<string, number[]> = {};
  engineKeys.forEach((key, idx) => {
    const baseSeed = vesselId * 2000 + idx * 200;
    const base = 25 + idx * 8;
    valueArrays[key] = seededValues(baseSeed, HOURS.length, base, base + 60);
  });

  HOURS.forEach((time, i) => {
    const point: ConsumptionSpeedPoint = { time, speed: speedValues[i] };
    engineKeys.forEach((key) => {
      point[key] = valueArrays[key][i];
    });
    data.push(point);
  });

  return data;
}

// ─── Engine-count lookup (matches ships.ts) ──────────────────────────────────

const vesselEngineCounts: Record<number, number> = {
  1: 3, 2: 2, 3: 4, 4: 3, 5: 2, 6: 3, 7: 4, 8: 2, 9: 3, 10: 2,
};

// ─── Public API ──────────────────────────────────────────────────────────────

export function getChartData(vesselId: number): VesselChartData {
  const engineCount = vesselEngineCounts[vesselId] ?? 3;
  return {
    consumption: generateConsumption(vesselId, engineCount),
    consumptionVsSpeed: generateConsumptionVsSpeed(vesselId, engineCount),
  };
}
