'use client';

import PerfomaxCard from '@/components/cards/perfomax-card';
import type { HealthScoreEntry } from '@/types/api';
import cn from '@/utils/class-names';
import { type ParameterStats, fmtStat } from '@/utils/sensor-stats';

/**
 * SVG bell curve (normal distribution) — decorative illustration.
 */
function BellCurve({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 60"
      className={cn('h-12 w-20', className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 55 Q 15 55, 25 50 Q 35 40, 45 15 Q 50 5, 55 15 Q 65 40, 75 50 Q 85 55, 95 55"
        stroke="#EF4444"
        strokeWidth="2"
        fill="none"
      />
      {/* Center dashed line */}
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

/** Stat card — a bordered card section with a title and 3 rows of key-value pairs */
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

/**
 * Health Score Card — info card with:
 * - Header: Health score + Delta percentage
 * - 2 bell curves + Causality badge
 * - 3 stat cards (Title / Alarms / Peak)
 */
export default function HealthScoreCard({
  className,
  entry,
  isLoading,
  paramStats,
}: {
  className?: string;
  entry?: HealthScoreEntry;
  isLoading?: boolean;
  paramStats?: ParameterStats;
}) {
  const score = entry?.score;
  const delta = entry?.delta;
  const alarmCount = entry?.alarm_count ?? 0;
  const peakValue = entry?.peak_value ?? 0;
  const peakUnit = entry?.peak_unit ?? '';

  return (
    <PerfomaxCard className={cn('relative', className)} bodyClassName="p-5">
      {/* ─── Header: Health + Delta ─────────────────────────────── */}
      <div className="mb-5 flex items-baseline gap-10">
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

      {/* ─── Bell Curves + Causality ────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-1 flex items-center justify-center">
          <BellCurve />
        </div>
        <div className="col-span-1 flex items-center justify-center">
          <BellCurve />
        </div>
        <div className="col-span-1 flex flex-col items-center justify-center gap-2">
          <span className="text-sm font-semibold text-foreground">
            Causality
          </span>
          <span className="rounded-md bg-green-100 px-3 py-1.5 text-sm font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
            No Attention
          </span>
        </div>
      </div>

      {/* ─── Stat Cards ─────────────────────────────────────────── */}
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
              label: 'Dev',
              value: isLoading ? '…' : fmtStat(paramStats?.dev ?? null),
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
