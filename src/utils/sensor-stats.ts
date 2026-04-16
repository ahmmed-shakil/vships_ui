import type { SensorDataPoint } from '@/types/api';

export interface ParameterStats {
  /** Arithmetic mean of all non-null values over the full date range */
  avg: number | null;
  /** Mean of non-null values whose timestamp falls in the last 24 h of the range */
  movAvg: number | null;
  /** Sample standard deviation (÷ n−1) of all non-null values */
  dev: number | null;
}

function extractNumbers(data: SensorDataPoint[], key: string): number[] {
  return data
    .map((d) => d[key] as number | null)
    .filter((v): v is number => v !== null && !Number.isNaN(v));
}

function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function sampleStdDev(values: number[]): number | null {
  if (values.length < 2) return null;
  const avg = mean(values)!;
  const variance =
    values.reduce((sum, v) => sum + (v - avg) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

/**
 * Computes Average, 24-h Moving Average, and Standard Deviation for a single
 * sensor parameter across an already-fetched SensorDataPoint array.
 *
 * Null / NaN values are excluded from every calculation.
 *
 * @param data      - the full SensorDataPoint array returned by the API
 * @param dataKey   - the field name to extract (e.g. 'rpm', 'tc_rpm')
 */
export function computeParameterStats(
  data: SensorDataPoint[],
  dataKey: string
): ParameterStats {
  if (!data.length) return { avg: null, movAvg: null, dev: null };

  const allValues = extractNumbers(data, dataKey);

  // Moving average: mean of the last 24 h window relative to the last point
  const lastTs = new Date(data[data.length - 1].timestamp).getTime();
  const cutoff = lastTs - 24 * 60 * 60 * 1000;
  const last24hValues = data
    .filter((d) => new Date(d.timestamp).getTime() >= cutoff)
    .map((d) => d[dataKey] as number | null)
    .filter((v): v is number => v !== null && !Number.isNaN(v));

  return {
    avg: mean(allValues),
    movAvg: mean(last24hValues),
    dev: sampleStdDev(allValues),
  };
}

/** Format a stat value to 2 decimal places, or 'N/A' if null */
export function fmtStat(value: number | null): string {
  return value !== null ? value.toFixed(2) : 'N/A';
}
