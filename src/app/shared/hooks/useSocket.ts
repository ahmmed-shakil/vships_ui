'use client';

import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

type Socket = any; // v2 types are different, using any for simplicity in this hook

const SOCKET_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'https://ocean-pact-api.perfomax.tech';

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
      reconnectionAttempts: 5,
      query: {
        token,
        vessel_id: String(vesselId),
      },
    });

    socketRef.current = socket;
    prevVesselRef.current = vesselId;

    socket.on('connect', () => {
      console.log('Connected:', socket.id);
      setConnected(true);
    });

    socket.on('connect_error', (err) => {
      console.log('Connection error:', err.message);
    });

    socket.on('disconnect', (reason) => {
      console.log('Disconnected:', reason);
      setConnected(false);
    });

    socket.on('ME', (data) => {
      setLatestME((prev) => ({
        ...prev,
        [data.engineId]: { ...data, _receivedAt: Date.now() },
      }));
      setMeTotalCount((prev) => prev + 1);
    });

    socket.on('AE', (data) => {
      setLatestAE((prev) => ({
        ...prev,
        [data.engineId]: { ...data, _receivedAt: Date.now() },
      }));
      setAeTotalCount((prev) => prev + 1);
    });

    socket.on('DG', (data) => {
      setLatestDG((prev) => ({
        ...prev,
        [data.engineId]: { ...data, _receivedAt: Date.now() },
      }));
      setDgTotalCount((prev) => prev + 1);
    });

    return () => {
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
