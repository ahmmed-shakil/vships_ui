'use client';

import { useEffect, useRef, useState } from 'react';
import { getAccessToken, refreshAccessToken } from '@/services/api-client';
// @ts-expect-error - socket.io-client v2 types are no longer available in the latest registry version correctly
import io from 'socket.io-client';

type Socket = any; // v2 types are different, using any for simplicity in this hook

const SOCKET_URL =
  process.env.NEXT_PUBLIC_WS_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'https://vship-api.perfomax.tech';

// Keep a module-level record of active sockets to prevent multiple initializations
// and accidental disconnects during rapid React re-mounts.
const activeSockets: Record<string, { socket: Socket; count: number }> = {};

/** Decode a JWT and check whether it expires within the next 30 s. */
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1])) as { exp: number };
    return payload.exp * 1000 < Date.now() + 30_000;
  } catch {
    return true;
  }
}

/** Return a non-expired access token, refreshing via the API if necessary. */
async function getFreshToken(sessionToken: string): Promise<string | null> {
  let token = getAccessToken() || sessionToken;
  if (!isTokenExpired(token)) return token;

  console.log('[Socket] Token expired, refreshing…');
  const ok = await refreshAccessToken();
  if (ok) {
    token = getAccessToken() || sessionToken;
    if (!isTokenExpired(token)) {
      console.log('[Socket] Token refreshed');
      return token;
    }
  }
  console.warn('[Socket] Token refresh failed');
  return null;
}

export function useSocketData(vesselId: number | null, token: string | null) {
  const [latestME, setLatestME] = useState<Record<string, any>>({});
  const [latestAE, setLatestAE] = useState<Record<string, any>>({});
  const [latestDG, setLatestDG] = useState<Record<string, any>>({});
  const [meTotalCount, setMeTotalCount] = useState(0);
  const [aeTotalCount, setAeTotalCount] = useState(0);
  const [dgTotalCount, setDgTotalCount] = useState(0);
  const [connected, setConnected] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const prevVesselRef = useRef<number | null>(null);

  useEffect(() => {
    if (!token || !vesselId) return;

    let cancelled = false;
    const socketKey = String(vesselId);

    // ── Per-subscriber event handlers ──────────────────────────────
    // Use socketRef so handlers always reference the current socket
    // (important when the socket is swapped during reconnection).

    const onConnect = () => {
      console.log('[Socket] Connected:', socketRef.current?.id);
      setConnected(true);
      socketRef.current?.emit('join', String(vesselId));
    };

    const onDisconnect = (reason: any) => {
      console.warn('[Socket] Disconnected:', reason);
      setConnected(false);

      // Proactively refresh the token so it is cached by the time the
      // built-in reconnect attempt fires (after reconnectionDelay).
      if (!cancelled) {
        getFreshToken(token);
      }
    };

    const onDataME = (data: any) => {
      setLatestME((prev) => ({
        ...prev,
        [data.engineId]: { ...data, _receivedAt: Date.now() },
      }));
      setMeTotalCount((prev) => prev + 1);
    };

    const onDataAE = (data: any) => {
      setLatestAE((prev) => ({
        ...prev,
        [data.engineId]: { ...data, _receivedAt: Date.now() },
      }));
      setAeTotalCount((prev) => prev + 1);
    };

    const onDataDG = (data: any) => {
      setLatestDG((prev) => ({
        ...prev,
        [data.engineId]: { ...data, _receivedAt: Date.now() },
      }));
      setDgTotalCount((prev) => prev + 1);
    };

    // ── Reuse or create socket (async for token refresh) ──────────
    (async () => {
      // 1. Reuse existing connection for this vessel
      if (activeSockets[socketKey]) {
        activeSockets[socketKey].count++;
        socketRef.current = activeSockets[socketKey].socket;
        setConnected(socketRef.current.connected);
        console.log(
          `[Socket] Reusing connection for Vessel ${vesselId} (Subscribers: ${activeSockets[socketKey].count})`
        );
      } else {
        // 2. Ensure we have a valid (non-expired) token before connecting
        const freshToken = await getFreshToken(token);
        if (cancelled || !freshToken) {
          console.error('[Socket] Cannot connect — no valid token');
          return;
        }

        console.log(
          `[Socket] Initializing NEW connection for Vessel ${vesselId}…`
        );
        const socket = io(SOCKET_URL, {
          transports: ['websocket'],
          query: { vessel_id: String(vesselId), token: freshToken },
          reconnection: true,
          reconnectionAttempts: Infinity,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
        });

        // Before each built-in reconnect attempt, swap in the latest
        // cached token (refreshed proactively in onDisconnect above).
        socket.io.on('reconnect_attempt', () => {
          const latest = getAccessToken() || token;
          socket.io.opts.query = {
            vessel_id: String(vesselId),
            token: latest,
          };
          console.log('[Socket] Reconnecting with updated token…');
        });

        activeSockets[socketKey] = { socket, count: 1 };
        socketRef.current = socket;
      }

      if (cancelled) return;

      const socket = socketRef.current!;
      prevVesselRef.current = vesselId;

      socket.on('connect', onConnect);
      socket.on('disconnect', onDisconnect);
      socket.on('ME', onDataME);
      socket.on('AE', onDataAE);
      socket.on('DG', onDataDG);
    })();

    return () => {
      cancelled = true;
      if (activeSockets[socketKey]) {
        activeSockets[socketKey].count--;

        if (activeSockets[socketKey].count <= 0) {
          console.log('[Socket] Closing connection (No subscribers)');
          const socket = activeSockets[socketKey].socket;
          socket.disconnect();
          delete activeSockets[socketKey];
        } else {
          console.log(
            `[Socket] Detaching subscriber (Remaining: ${activeSockets[socketKey].count})`
          );
          const socket = activeSockets[socketKey].socket;
          socket.off('connect', onConnect);
          socket.off('disconnect', onDisconnect);
          socket.off('ME', onDataME);
          socket.off('AE', onDataAE);
          socket.off('DG', onDataDG);
        }
      }
      socketRef.current = null;
    };
  }, [token, vesselId]);

  /** Switch vessel room without reconnecting */
  const switchVessel = (newVesselId: number) => {
    const s = socketRef.current;
    if (!s) return;
    if (prevVesselRef.current) {
      s.emit('leave', String(prevVesselRef.current));
    }
    s.emit('join', String(newVesselId));
    prevVesselRef.current = newVesselId;
    // Clear stale data
    setLatestME({});
    setLatestAE({});
    setLatestDG({});
  };

  return {
    latestME,
    latestAE,
    latestDG,
    meTotalCount,
    aeTotalCount,
    dgTotalCount,
    connected,
    switchVessel,
  };
}
