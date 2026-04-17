'use client';

import cn from '@/utils/class-names';
import { useEffect, useState } from 'react';
import { PiArrowClockwise } from 'react-icons/pi';

interface AutoRefreshCountdownProps {
  /** Whether a refresh is currently in flight (controls the spinner + label). */
  isRefreshing?: boolean;
  /** Seconds between automatic refreshes. Defaults to 30. */
  intervalSeconds?: number;
  /**
   * Called every time the countdown reaches 0 and when the manual refresh
   * button is clicked. Parents should use this to bump a refresh trigger.
   */
  onRefresh: () => void;
  className?: string;
}

/**
 * Small shared header control that shows "Auto-refresh in Ns" / "Updating…"
 * alongside a manual refresh button. Matches the behavior used on the
 * /real-time-data/trend-analysis page.
 */
export default function AutoRefreshCountdown({
  isRefreshing = false,
  intervalSeconds = 30,
  onRefresh,
  className,
}: AutoRefreshCountdownProps) {
  const [countdownSeconds, setCountdownSeconds] = useState(intervalSeconds);

  // Fire the refresh on every full interval and reset the countdown.
  useEffect(() => {
    const intervalId = window.setInterval(() => {
      onRefresh();
      setCountdownSeconds(intervalSeconds);
    }, intervalSeconds * 1000);

    return () => window.clearInterval(intervalId);
  }, [intervalSeconds, onRefresh]);

  // 1Hz tick for the visible countdown.
  useEffect(() => {
    const countdownId = window.setInterval(() => {
      setCountdownSeconds((value) => (value <= 1 ? 0 : value - 1));
    }, 1_000);

    return () => window.clearInterval(countdownId);
  }, []);

  const handleManualRefresh = () => {
    onRefresh();
    setCountdownSeconds(intervalSeconds);
  };

  return (
    <div
      className={cn(
        'flex items-center justify-end gap-3 text-sm text-muted-foreground',
        className
      )}
    >
      <span>
        {isRefreshing
          ? 'Updating data...'
          : `Auto-refresh in ${countdownSeconds}s`}
      </span>
      <button
        type="button"
        onClick={handleManualRefresh}
        disabled={isRefreshing}
        aria-label="Refresh data now"
        className="inline-flex items-center justify-center rounded-md border border-border bg-background p-1.5 text-foreground transition-colors hover:bg-muted/60 disabled:pointer-events-none disabled:opacity-50"
      >
        <PiArrowClockwise
          className={cn('size-4', isRefreshing && 'animate-spin')}
          aria-hidden
        />
      </button>
    </div>
  );
}
