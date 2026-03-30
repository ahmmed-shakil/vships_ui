'use client';

import { useEffect, useRef, useState } from 'react';
// @ts-expect-error - socket.io-client v2 types are no longer available in the latest registry version correctly
import io from 'socket.io-client';


type Socket = any; // v2 types are different, using any for simplicity in this hook

const SOCKET_URL =
  process.env.NEXT_PUBLIC_WS_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'https://vship-api.perfomax.tech';

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

    // Reset state for new connection
    setLatestME({});
    setLatestAE({});
    setLatestDG({});
    setMeTotalCount(0);
    setAeTotalCount(0);
    setDgTotalCount(0);

    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      // Prefer socket.io auth payload over query token when supported.
      auth: { token },
      query: { vessel_id: String(vesselId) },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketRef.current = socket;
    prevVesselRef.current = vesselId;

    // Set up listeners (Socket.io listeners are additive in some versions, but v2 handles .on well)
    // Using .off().on() pattern to ensure we don't double-subscribe if re-mounted
    const onConnect = () => {
      console.log('[Socket] Connected:', socket.id);
      setConnected(true);
      // Some backends expect an explicit room join; safe no-op if not used.
      socket.emit('join', String(vesselId));
    });

    socket.on('connect_error', (err: any) => {
      console.log('Connection error:', err.message);
      setConnected(false);
    });

    socket.on('disconnect', (reason: any) => {
      console.log('Disconnected:', reason);
      setConnected(false);
    };

    const onDataME = (data: any) => {
      console.log("[Socket] ME data received:", data.engineId);
      setLatestME((prev) => ({
        ...prev,
        [data.engineId]: { ...data, _receivedAt: Date.now() },
      }));
      setMeTotalCount((prev) => prev + 1);
    };

    const onDataAE = (data: any) => {
      console.log("[Socket] AE data received:", data.engineId);
      setLatestAE((prev) => ({
        ...prev,
        [data.engineId]: { ...data, _receivedAt: Date.now() },
      }));
      setAeTotalCount((prev) => prev + 1);
    };

    const onDataDG = (data: any) => {
      console.log("[Socket] DG data received:", data.engineId);
      setLatestDG((prev) => ({
        ...prev,
        [data.engineId]: { ...data, _receivedAt: Date.now() },
      }));
      setDgTotalCount((prev) => prev + 1);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('ME', onDataME);
    socket.on('AE', onDataAE);
    socket.on('DG', onDataDG);

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
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
