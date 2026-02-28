'use client';

import PerfomaxCard from '@/components/cards/perfomax-card';
import cn from '@/utils/class-names';

/**
 * SVG bell curve (normal distribution) — decorative illustration.
 */
function BellCurve({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 100 60" className={cn('w-20 h-12', className)} fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M5 55 Q 15 55, 25 50 Q 35 40, 45 15 Q 50 5, 55 15 Q 65 40, 75 50 Q 85 55, 95 55"
                stroke="#EF4444"
                strokeWidth="2"
                fill="none"
            />
            {/* Center dashed line */}
            <line x1="50" y1="5" x2="50" y2="55" stroke="#EF4444" strokeWidth="1" strokeDasharray="3 2" />
        </svg>
    );
}

/** Stat card — a bordered card section with a title and 3 rows of key-value pairs */
function StatCard({ title, rows, className }: { title: string; rows: { label: string; value: React.ReactNode }[]; className?: string }) {
    return (
        <div className={cn("rounded-lg bg-background/90 px-3 py-5", className)}>
            <h4 className="text-xs font-bold text-foreground text-center">{title}</h4>
            <div className="flex flex-col gap-6 mt-6">
                {rows.map((row, i) => (
                    <div key={i} className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground font-medium">{row.label}</span>
                        <span className="text-sm font-bold text-foreground">{row.value}</span>
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
export default function HealthScoreCard({ className }: { className?: string }) {
    return (
        <PerfomaxCard
            className={cn('relative', className)}
            bodyClassName="p-5"
        >
            {/* ─── Header: Health + Delta ─────────────────────────────── */}
            <div className="flex items-baseline gap-8 mb-5">
                <div className="flex items-baseline gap-2">
                    <span className="text-base font-semibold text-foreground">Health</span>
                    <span className="text-3xl font-bold text-primary">80%</span>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-base font-semibold text-foreground">Delta</span>
                    <span className="text-3xl font-bold text-foreground">5%</span>
                </div>
            </div>

            {/* ─── Bell Curves + Causality ────────────────────────────── */}
            <div className="flex items-center justify-between">
                <div className="flex items-end gap-0">
                    <BellCurve />
                    <BellCurve className="ml-10" />
                </div>
                <div className="flex flex-col items-end gap-1.5">
                    <span className="text-xs font-semibold text-foreground">Causality</span>
                    <span className="rounded-md bg-green-100 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        No Attention
                    </span>
                </div>
            </div>

            {/* ─── Stat Cards ─────────────────────────────────────────── */}
            <div className="grid grid-cols-3 gap-0.5 mt-4 border-t-2 pt-10">
                <StatCard
                    title="Title"
                    rows={[
                        { label: 'Avg', value: '700' },
                        { label: 'Mov Avg', value: '630' },
                        { label: 'Dev', value: '80' },
                    ]}
                />
                <StatCard
                    title="Alarms"
                    rows={[
                        { label: '7d', value: '11' },
                        { label: '24h', value: '4' },
                        { label: '1h', value: '1' },
                    ]}
                />
                <StatCard
                    title="Peak"
                    rows={[
                        { label: 'Period', value: '2d' },
                        { label: 'Intensity', value: '20%' },
                        {
                            label: 'Status',
                            value: (
                                <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                    Check
                                </span>
                            ),
                        },
                    ]}
                />
            </div>
        </PerfomaxCard>
    );
}
