'use client';

import PerfomaxCard from '@/components/cards/perfomax-card';
import type { HealthScoreEntry } from '@/types/api';
import cn from '@/utils/class-names';
import { type ParameterStats, fmtStat } from '@/utils/sensor-stats';
import { useState } from 'react';

// ─── Decorative bell-curve SVG (placeholder) ─────────────────────────────────
function BellCurveSvg({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 60"
      className={cn('h-14 w-full', className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 55 Q 15 55, 25 50 Q 35 40, 45 15 Q 50 5, 55 15 Q 65 40, 75 50 Q 85 55, 95 55"
        stroke="#EF4444"
        strokeWidth="2"
        fill="none"
      />
      <line
        x1="50"
        y1="5"
        x2="50"
        y2="55"
        stroke="#EF4444"
        strokeWidth="1"
        strokeDasharray="3 2"
      />
    </svg>
  );
}

/**
 * Distribution histogram with a vertical median line.
 *
 * Values are bucketed into N bins; bar heights show the count per bin.
 * A dashed vertical line marks the median value within the distribution.
 * All bars and the line are red, matching the card's visual language.
 *
 * Hovering a bar reveals a tooltip explaining the bin range, the count of
 * sensor samples that fell into it, its share of the dataset, and the
 * median value marked by the dashed line.
 *
 * Falls back to the decorative bell-curve SVG when there is insufficient data.
 */
function DistributionChart({
  values,
  median,
}: {
  values: number[];
  median: number | null;
}) {
  const [hoveredBin, setHoveredBin] = useState<number | null>(null);
  const N = 8;

  if (values.length < 2 || median === null) {
    return <BellCurveSvg />;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1; // guard against all-same values
  const binWidth = range / N;
  const total = values.length;

  const bins = Array.from({ length: N }, (_, i) => {
    const lo = min + i * binWidth;
    const hi = lo + binWidth;
    const count = values.filter(
      (v) => v >= lo && (i === N - 1 ? v <= hi : v < hi)
    ).length;
    return { lo, hi, count };
  });

  const maxCount = Math.max(...bins.map((b) => b.count), 1);

  // Percentage position of the median within [min, max]
  const medianPct = Math.max(0, Math.min(100, ((median - min) / range) * 100));

  const fmt = (n: number) =>
    n.toLocaleString(undefined, { maximumFractionDigits: 2 });

  const hovered = hoveredBin !== null ? bins[hoveredBin] : null;

  return (
    <div className="relative h-14 w-full">
      <div
        className="flex h-full w-full items-end gap-px"
        onMouseLeave={() => setHoveredBin(null)}
      >
        {bins.map((bin, i) => {
          const pct = ((bin.count / total) * 100).toFixed(1);
          const ariaLabel = `${fmt(bin.lo)} to ${fmt(bin.hi)}: ${bin.count} ${
            bin.count === 1 ? 'value' : 'values'
          } (${pct}%)`;
          return (
            <div
              key={i}
              role="img"
              aria-label={ariaLabel}
              title={ariaLabel}
              onMouseEnter={() => setHoveredBin(i)}
              className={cn(
                'flex-1 cursor-pointer rounded-sm bg-red-500/60 transition-colors hover:bg-red-500',
                hoveredBin === i && 'bg-red-500'
              )}
              style={{ height: `${(bin.count / maxCount) * 100}%` }}
            />
          );
        })}
      </div>
      {/* Vertical median line */}
      <div
        className="pointer-events-none absolute inset-y-0 border-l-2 border-dashed border-red-500"
        style={{ left: `${medianPct}%` }}
        aria-hidden
      />
      {/* Hover tooltip — always anchored to the right side of the hovered
          bar so the tooltip consistently grows rightward, including for the
          rightmost bar. Sits on top of neighboring grid cells via z-20. */}
      {hovered && hoveredBin !== null && (
        <div
          role="tooltip"
          className="border-border pointer-events-none absolute z-20 min-w-[150px] rounded-md border bg-background px-2.5 py-1.5 text-[11px] leading-tight shadow-md"
          style={{
            left: `${((hoveredBin + 1) / N) * 100}%`,
            top: -6,
            marginLeft: 4,
            transform: 'translateY(-100%)',
          }}
        >
          <div className="font-semibold text-foreground">
            {fmt(hovered.lo)} – {fmt(hovered.hi)}
          </div>
          <div className="mt-0.5 flex items-center justify-between gap-3 text-muted-foreground">
            <span>Count</span>
            <span className="font-semibold text-foreground">
              {hovered.count} ({((hovered.count / total) * 100).toFixed(1)}%)
            </span>
          </div>
          <div className="mt-0.5 flex items-center justify-between gap-3 text-muted-foreground">
            <span>Median</span>
            <span className="font-semibold text-foreground">{fmt(median)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({
  title,
  rows,
  className,
}: {
  title: string;
  rows: { label: string; value: React.ReactNode }[];
  className?: string;
}) {
  return (
    <div className={cn('rounded-lg bg-background/90 px-3 py-5', className)}>
      <h4 className="text-center text-base font-bold text-foreground">
        {title}
      </h4>
      <div className="mt-6 flex flex-col gap-6">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              {row.label}
            </span>
            <span className="text-sm font-bold text-foreground">
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main card ────────────────────────────────────────────────────────────────
/**
 * Health Score Card layout:
 *
 *  ┌──────────────────────────────┐
 *  │ Score  N/A   Delta  N/A      │  ← header
 *  ├──────────────┬───────┬───────┤
 *  │ DistChart    │ Bell  │Causal.│  ← mini charts / badge row
 *  ├──────────────┼───────┼───────┤
 *  │ Stats        │Alarms │ Peak  │  ← stat cards
 *  └──────────────┴───────┴───────┘
 */
export default function HealthScoreCard({
  className,
  entry,
  isLoading,
  paramStats,
  paramValues = [],
}: {
  className?: string;
  entry?: HealthScoreEntry;
  isLoading?: boolean;
  paramStats?: ParameterStats;
  /** Non-null, non-zero sensor values for the distribution chart */
  paramValues?: number[];
}) {
  const score = entry?.score;
  const delta = entry?.delta;
  const alarmCount = entry?.alarm_count ?? 0;
  const peakValue = entry?.peak_value ?? 0;
  const peakUnit = entry?.peak_unit ?? '';

  return (
    <PerfomaxCard className={cn('relative', className)} bodyClassName="p-5">
      {/* ─── Header: Score + Delta ──────────────────────────────────── */}
      <div className="mb-4 flex items-baseline gap-10">
        <div className="flex items-baseline gap-2">
          <span className="text-[20px] font-bold leading-7 text-foreground">
            Score
          </span>
          <span className="text-4xl font-bold text-primary">
            {isLoading ? '…' : score == null ? 'N/A' : `${score}%`}
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-[20px] font-bold leading-7 text-foreground">
            Delta
          </span>
          <span className="text-4xl font-bold text-foreground">
            {isLoading ? '…' : delta == null ? 'N/A' : `${delta}%`}
          </span>
        </div>
      </div>

      {/* ─── Mini-chart row (aligns 1-to-1 with stat cards below) ──── */}
      <div className="grid grid-cols-3 gap-2">
        {/* Above "Stats" — distribution histogram with vertical median line */}
        <div className="flex items-end">
          <DistributionChart
            values={isLoading ? [] : paramValues}
            median={paramStats?.median ?? null}
          />
        </div>

        {/* Above "Alarms" — decorative bell-curve placeholder */}
        <div className="flex items-end">
          <BellCurveSvg />
        </div>

        {/* Above "Peak" — Causality badge */}
        <div className="flex flex-col items-center justify-end gap-2 pb-1">
          <span className="text-sm font-semibold text-foreground">
            Causality
          </span>
          <span className="rounded-md bg-green-100 px-3 py-1.5 text-sm font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
            No Attention
          </span>
        </div>
      </div>

      {/* ─── Stat cards ─────────────────────────────────────────────── */}
      <div className="mt-4 grid grid-cols-3 gap-2 border-t-2 pt-6">
        <StatCard
          title="Stats"
          rows={[
            {
              label: 'Avg',
              value: isLoading ? '…' : fmtStat(paramStats?.avg ?? null),
            },
            {
              label: 'Mov Avg',
              value: isLoading ? '…' : fmtStat(paramStats?.movAvg ?? null),
            },
            {
              label: 'Med',
              value: isLoading ? '…' : fmtStat(paramStats?.median ?? null),
            },
          ]}
        />
        <StatCard
          title="Alarms"
          rows={[
            { label: 'Total', value: isLoading ? '…' : String(alarmCount) },
            { label: '24h', value: '--' },
            { label: '1h', value: '--' },
          ]}
        />
        <StatCard
          title="Peak"
          rows={[
            {
              label: 'Value',
              value: isLoading
                ? '…'
                : `${peakValue}${peakUnit ? ` ${peakUnit}` : ''}`,
            },
            { label: 'Intensity', value: '--' },
            {
              label: 'Status',
              value: (
                <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  {score != null
                    ? score >= 70
                      ? 'OK'
                      : score >= 40
                        ? 'Check'
                        : 'Alert'
                    : '--'}
                </span>
              ),
            },
          ]}
        />
      </div>
    </PerfomaxCard>
  );
}
