'use client';

import { Text } from 'rizzui';
import HealthGauge from '../machinery-overview/health-gauge';
import { getHealthColor } from '../../utils/get-health-color';
import cn from '../../utils/class-names';

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

export interface HealthScoreHeaderProps {
  /** Health percentage 0-100 */
  score: number | null;
  /** Override the auto-derived colour */
  color?: string;
  /** Gauge pixel width (default 70) */
  size?: number;
  /** Label shown next to the gauge (default "Health\nscore") */
  label?: string;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

/**
 * Standalone health-score badge meant to be dropped into any card's
 * `action` slot.
 *
 * @example
 * ```tsx
 * <PerfomaxCard
 *   title="Engine 1"
 *   action={<HealthScoreHeader score={80} />}
 * />
 * ```
 */
export default function HealthScoreHeader({
  score,
  color,
  size = 70,
  label = 'Health\nscore',
  className,
}: HealthScoreHeaderProps) {
  const hasScore = typeof score === 'number' && !Number.isNaN(score);
  const resolvedColor = color ?? (hasScore ? getHealthColor(score) : '#9CA3AF');

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded px-[7px] py-1.5',
        className
      )}
      style={{ background: `${resolvedColor}15` }}
    >
      <Text className="text-center text-base font-bold leading-[17px] opacity-90">
        {label.split('\n').map((line, i) => (
          <span key={i}>
            {i > 0 && <br />}
            {line}
          </span>
        ))}
      </Text>
      <HealthGauge
        value={score}
        size={size}
        color={resolvedColor}
        label={hasScore ? undefined : 'N/A'}
      />
    </div>
  );
}
