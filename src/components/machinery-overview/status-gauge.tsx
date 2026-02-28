'use client';

import { MachineryStatus } from '@/types';
import cn from '@/utils/class-names';

/* ------------------------------------------------------------------ */
/*  Status colour + label config                                       */
/* ------------------------------------------------------------------ */

const statusConfig: Record<
    MachineryStatus,
    { label: string; dotColor: string; bgColor: string; textColor: string }
> = {
    running: {
        label: 'Running',
        dotColor: 'bg-green-500',
        bgColor: 'bg-green-500/10',
        textColor: 'text-green-600 dark:text-green-400',
    },
    standby: {
        label: 'Standby',
        dotColor: 'bg-amber-500',
        bgColor: 'bg-amber-500/10',
        textColor: 'text-amber-600 dark:text-amber-400',
    },
    off: {
        label: 'Off',
        dotColor: 'bg-gray-400',
        bgColor: 'bg-gray-400/10',
        textColor: 'text-gray-500 dark:text-gray-400',
    },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export interface StatusGaugeProps {
    status: MachineryStatus;
    className?: string;
}

/**
 * A small status badge showing engine status: Running / Standby / Off.
 * Designed to sit in the card header between title and health score.
 */
export default function StatusGauge({ status, className }: StatusGaugeProps) {
    const cfg = statusConfig[status];

    return (
        <div
            className={cn(
                'flex items-center gap-0.5 rounded-full px-1.5 py-0.5',
                cfg.bgColor,
                className
            )}
        >
            {/* Animated dot for "running" */}
            <span
                className={cn(
                    'inline-block size-3 rounded-full',
                    cfg.dotColor,
                    status === 'running' && 'animate-pulse'
                )}
            />
            <span className={cn('text-[9px] font-semibold', cfg.textColor)}>
                {cfg.label}
            </span>
        </div>
    );
}
