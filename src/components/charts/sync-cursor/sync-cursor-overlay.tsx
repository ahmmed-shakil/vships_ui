'use client';

/**
 * SyncCursorOverlay
 *
 * A tiny presentational component that listens to the shared sync-cursor store
 * and imperatively positions a vertical line inside a chart container.
 *
 * Key design points:
 *  - Positioning is done with `transform: translate3d(x,0,0)` on a DOM node.
 *    No React re-renders happen while the cursor moves — the store pushes an
 *    updated state, the subscriber reads it inside a RAF callback, and mutates
 *    the DOM directly. This is what gives the Grafana-like smoothness.
 *  - The plot area is measured from the Recharts-generated SVG so pixel x
 *    stays correct regardless of margins, axis widths or responsive resizing.
 *  - The overlay hides itself when there is no hover, or when this chart is
 *    the source of the hover (Recharts already draws a native cursor on the
 *    source chart).
 */

import { useEffect, useLayoutEffect, useRef } from 'react';

import { useSyncCursorStore, type SyncCursorState } from './sync-cursor-store';

interface SyncCursorOverlayProps {
  /** Ref to the relatively-positioned container that wraps the Recharts SVG. */
  containerRef: React.RefObject<HTMLElement | null>;
  /** Ordered x-axis values for this chart (typically ISO timestamps). */
  timestamps: readonly string[];
  /** Unique id so the overlay can skip drawing on its own chart. */
  chartId: string;
  /** Color of the line. Matches the reference-line style used previously. */
  color?: string;
  /**
   * Horizontal padding configured on the Recharts XAxis via
   * `padding={{ left, right }}`. Needed so the first / last data points map
   * to the correct pixel.
   */
  xAxisPadding?: { left?: number; right?: number };
}

interface PlotBox {
  left: number;
  width: number;
  top: number;
  height: number;
}

function measurePlotArea(container: HTMLElement): PlotBox | null {
  const containerRect = container.getBoundingClientRect();
  if (containerRect.width === 0 || containerRect.height === 0) return null;

  // Prefer the cartesian-grid <g>: its bounding box equals the inner plot area
  // and is stable across Recharts versions. Fall back to the x-axis line for
  // safety (e.g. when grid lines are disabled).
  const grid = container.querySelector('.recharts-cartesian-grid');
  if (grid instanceof SVGGraphicsElement) {
    const r = grid.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) {
      return {
        left: r.left - containerRect.left,
        width: r.width,
        top: r.top - containerRect.top,
        height: r.height,
      };
    }
  }

  const axisLine = container.querySelector(
    '.recharts-xAxis .recharts-cartesian-axis-line'
  );
  if (axisLine instanceof SVGGraphicsElement) {
    const r = axisLine.getBoundingClientRect();
    if (r.width > 0) {
      return {
        left: r.left - containerRect.left,
        width: r.width,
        top: 0,
        height: r.top - containerRect.top,
      };
    }
  }

  return null;
}

/** Binary-search-ish lookup; timestamps are assumed chronologically sorted. */
function findTimestampIndex(
  timestamps: readonly string[],
  target: string
): number {
  // Fast path: linear indexOf wins on small arrays (< ~1k) due to tight loop.
  const direct = timestamps.indexOf(target);
  if (direct !== -1) return direct;

  // Fallback: numeric comparison in case the server / chart differ by
  // trailing 'Z' or millisecond precision.
  const targetMs = Date.parse(target);
  if (Number.isNaN(targetMs)) return -1;

  let best = -1;
  let bestDelta = Infinity;
  for (let i = 0; i < timestamps.length; i++) {
    const ms = Date.parse(timestamps[i]!);
    if (Number.isNaN(ms)) continue;
    const delta = Math.abs(ms - targetMs);
    if (delta < bestDelta) {
      bestDelta = delta;
      best = i;
    }
  }
  return best;
}

export function SyncCursorOverlay({
  containerRef,
  timestamps,
  chartId,
  color = 'rgba(250, 250, 250, 0.55)',
  xAxisPadding,
}: SyncCursorOverlayProps) {
  const store = useSyncCursorStore();
  const lineRef = useRef<HTMLDivElement>(null);
  const plotRef = useRef<PlotBox | null>(null);
  const latestStateRef = useRef<SyncCursorState>({
    timestamp: null,
    sourceChartId: null,
  });

  const padLeft = xAxisPadding?.left ?? 0;
  const padRight = xAxisPadding?.right ?? 0;

  // Render a frame based on the latest known state + plot dimensions.
  //
  // NOTE: `paint` is redefined on every render so it captures the freshest
  // `timestamps`, `chartId`, padding, etc. The subscription below routes
  // through `paintRef.current` so it always invokes the latest closure —
  // otherwise the subscriber would hold onto the first render's empty
  // timestamps array and never draw the line.
  const paint = () => {
    const line = lineRef.current;
    if (!line) return;

    const state = latestStateRef.current;
    const timestamp = state.timestamp;

    if (!timestamp || state.sourceChartId === chartId) {
      line.style.opacity = '0';
      return;
    }

    const container = containerRef.current;
    if (!container) {
      line.style.opacity = '0';
      return;
    }

    const plot = plotRef.current ?? measurePlotArea(container);
    if (!plot) {
      line.style.opacity = '0';
      return;
    }
    plotRef.current = plot;

    if (timestamps.length === 0) {
      line.style.opacity = '0';
      return;
    }

    const idx = findTimestampIndex(timestamps, timestamp);
    if (idx < 0) {
      line.style.opacity = '0';
      return;
    }

    const usable = Math.max(1, plot.width - padLeft - padRight);
    const denom = Math.max(1, timestamps.length - 1);
    const x = plot.left + padLeft + (idx / denom) * usable;

    line.style.opacity = '1';
    line.style.height = `${plot.height}px`;
    line.style.transform = `translate3d(${x}px, ${plot.top}px, 0)`;
  };

  const paintRef = useRef(paint);
  paintRef.current = paint;

  // Subscribe to the store. The store itself is RAF-throttled, so the
  // subscription fires at most once per animation frame. We go through
  // `paintRef.current` so data updates (new timestamps) are reflected
  // without needing to re-subscribe.
  useEffect(() => {
    if (!store) return;

    latestStateRef.current = store.getState();
    paintRef.current();

    const unsubscribe = store.subscribe((next) => {
      latestStateRef.current = next;
      paintRef.current();
    });

    return unsubscribe;
  }, [store, chartId]);

  // Re-measure when timestamps change (new data arrived) or on resize.
  useLayoutEffect(() => {
    plotRef.current = null;
    paintRef.current();

    const container = containerRef.current;
    if (!container || typeof ResizeObserver === 'undefined') return;

    const ro = new ResizeObserver(() => {
      plotRef.current = null;
      paintRef.current();
    });
    ro.observe(container);

    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timestamps]);

  if (!store) return null;

  return (
    <div
      ref={lineRef}
      aria-hidden
      className="pointer-events-none absolute left-0 top-0"
      style={{
        width: '1px',
        height: 0,
        opacity: 0,
        background: color,
        // GPU-compose so moving the line does not trigger layout / paint.
        willChange: 'transform, opacity',
        transform: 'translate3d(0,0,0)',
        transition: 'opacity 100ms linear',
      }}
    />
  );
}
