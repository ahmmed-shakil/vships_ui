'use client';

import cn from '@/utils/class-names';
import { useId } from 'react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';

/* ------------------------------------------------------------------ */
/*  Dummy last-1h data (no real wiring needed)                         */
/* ------------------------------------------------------------------ */

const sparkData = [
  { v: 0 },
  { v: 10 },
  { v: 20 },
  { v: 30 },
  { v: 56 },
  { v: 82 },
  { v: 70 },
  { v: 65 },
  { v: 30 },
  { v: 5 },
  { v: 20 },
  { v: 69 },
  { v: 77 },
  { v: 83 },
  { v: 67 },
  { v: 79 },
  { v: 100 },
  { v: 73 },
  { v: 64 },
  { v: 75 },
  { v: 81 },
  { v: 70 },
  { v: 40 },
  { v: 20 },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export interface RpmSparklineProps {
  /** Override sparkline data (default: dummy) */
  data?: { v: number }[];
  /** Stroke colour (default: currentColor-based blue) */
  color?: string;
  className?: string;
}

/**
 * A tiny inline area-chart sparkline designed to sit after the RPM value
 * inside a metrics row. Shows a ~1 h trend. No axes, no tooltip.
 */
export default function RpmSparkline({
  data = sparkData,
  color = '#3872FA',
  className,
}: RpmSparklineProps) {
  const rawId = useId();
  const gradientId = rawId.replace(/:/g, '_');

  return (
    <div className={cn('inline-flex h-5 w-[50px] shrink-0', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            fill={`url(#${gradientId})`}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
