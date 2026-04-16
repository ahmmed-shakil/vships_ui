import type { SensorDataPoint } from '@/types/api';

export interface ParameterStats {
  /** Arithmetic mean — excludes null and zero values, full date range */
  avg: number | null;
  /**
   * Mean of valid (non-null, non-zero) values whose timestamp falls within the
   * last 24 h of the selected range (last data-point timestamp − 24 h).
   *
   * Edge cases:
   *  - Range shorter than 24 h → movAvg equals avg (all points in window).
   *  - Historical custom range not including today → still computes trailing
   *    24 h of *that* range.  See STATS-GUIDE.md for the optional backend
   *    endpoint when a "live" 24 h MA is required.
   */
  movAvg: number | null;
  /** Median — excludes null and zero values, full date range */
  median: number | null;
}

/** Extract valid numeric values: rejects null, NaN, and 0. */
function extractNumbers(data: SensorDataPoint[], key: string): number[] {
  return data
    .map((d) => d[key] as number | null)
    .filter((v): v is number => v !== null && !Number.isNaN(v) && v !== 0);
}

function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

/**
 * Returns the effective non-null, non-zero number array for a sensor key,
 * falling back to `fallbackDataKey` when the primary key yields no valid values.
 */
export function extractParameterValues(
  data: SensorDataPoint[],
  dataKey: string,
  fallbackDataKey?: string
): number[] {
  const primary = extractNumbers(data, dataKey);
  if (primary.length > 0) return primary;
  return fallbackDataKey ? extractNumbers(data, fallbackDataKey) : [];
}

/**
 * Computes Average, 24-h Moving Average, and Median for a single sensor
 * parameter across an already-fetched SensorDataPoint array.
 *
 * Null, NaN, and **zero** values are excluded from every calculation.
 *
 * @param data            - the full SensorDataPoint array returned by the API
 * @param dataKey         - the primary field name to extract (e.g. 'rpm')
 * @param fallbackDataKey - used when `dataKey` yields no valid values (e.g. 'eg_temp_1')
 */
export function computeParameterStats(
  data: SensorDataPoint[],
  dataKey: string,
  fallbackDataKey?: string
): ParameterStats {
  if (!data.length) return { avg: null, movAvg: null, median: null };

  // Resolve effective key: use fallback if primary has no valid data
  const effectiveKey =
    fallbackDataKey && extractNumbers(data, dataKey).length === 0
      ? fallbackDataKey
      : dataKey;

  const allValues = extractNumbers(data, effectiveKey);

  // Moving average: mean of valid values within the last 24 h of the range
  const lastTs = new Date(data[data.length - 1].timestamp).getTime();
  const cutoff = lastTs - 24 * 60 * 60 * 1000;
  const last24hValues = data
    .filter((d) => new Date(d.timestamp).getTime() >= cutoff)
    .map((d) => d[effectiveKey] as number | null)
    .filter((v): v is number => v !== null && !Number.isNaN(v) && v !== 0);

  return {
    avg: mean(allValues),
    movAvg: mean(last24hValues),
    median: median(allValues),
  };
}

/** Format a stat value to 2 decimal places, or 'N/A' if null */
export function fmtStat(value: number | null): string {
  return value !== null ? value.toFixed(2) : 'N/A';
}
