/**
 * Map a 0-100 health score to a hex colour.
 *
 * ≥ 90 → green · ≥ 70 → orange · ≥ 50 → amber · < 50 → red
 */
export function getHealthColor(score: number): string {
  if (score >= 90) return '#22c55e';
  if (score >= 70) return '#e8862a';
  if (score >= 50) return '#f59e0b';
  return '#ef4444';
}
