'use client';

/**
 * SyncCursor — shared hover state across multiple charts.
 *
 * Why an external store instead of React state?
 *  - `onMouseMove` on Recharts fires dozens of times per second.
 *  - If we stored the hovered timestamp in React state, every chart inside the
 *    provider would re-render on every pixel of mouse movement. For a page with
 *    many heavy charts (Recharts recomputes paths, gradients, domains, etc.)
 *    this produces the laggy feel reported by the client.
 *  - We keep the hover state in refs, publish changes through a tiny
 *    event-emitter, and coalesce with `requestAnimationFrame` so we at most
 *    flip state once per paint. Only subscribers (tiny overlay components)
 *    re-render, never the charts themselves.
 *
 * Public API
 *  - <SyncCursorProvider> — wraps a group of charts that should share a cursor.
 *  - useSyncCursorStore() — imperative access (publish + subscribe).
 */

import {
  createContext,
  useContext,
  useRef,
  type ReactNode,
} from 'react';

export interface SyncCursorState {
  /** The x-axis value (usually an ISO timestamp) being hovered. */
  timestamp: string | null;
  /** Chart that is the source of the hover. Overlays skip drawing on this id. */
  sourceChartId: string | null;
}

type Listener = (state: SyncCursorState) => void;

export interface SyncCursorStore {
  getState: () => SyncCursorState;
  subscribe: (listener: Listener) => () => void;
  /** Schedule a state update; multiple calls in the same frame are coalesced. */
  setState: (next: SyncCursorState) => void;
}

const DEFAULT_STATE: SyncCursorState = {
  timestamp: null,
  sourceChartId: null,
};

const SyncCursorContext = createContext<SyncCursorStore | null>(null);

function createStore(): SyncCursorStore {
  let state: SyncCursorState = DEFAULT_STATE;
  const listeners = new Set<Listener>();
  let rafId: number | null = null;
  let pending: SyncCursorState | null = null;

  const flush = () => {
    rafId = null;
    if (!pending) return;
    const next = pending;
    pending = null;
    if (
      next.timestamp === state.timestamp &&
      next.sourceChartId === state.sourceChartId
    ) {
      return;
    }
    state = next;
    listeners.forEach((listener) => listener(state));
  };

  return {
    getState: () => state,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    setState: (next) => {
      pending = next;
      if (rafId != null) return;
      rafId =
        typeof requestAnimationFrame === 'function'
          ? requestAnimationFrame(flush)
          : (setTimeout(flush, 16) as unknown as number);
    },
  };
}

export function SyncCursorProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<SyncCursorStore | null>(null);
  if (!storeRef.current) storeRef.current = createStore();
  return (
    <SyncCursorContext.Provider value={storeRef.current}>
      {children}
    </SyncCursorContext.Provider>
  );
}

/** Returns the active store or null when rendered outside of a provider. */
export function useSyncCursorStore(): SyncCursorStore | null {
  return useContext(SyncCursorContext);
}
