'use client';

import { useEffect, useRef, useState } from 'react';
// @ts-expect-error - socket.io-client v2 types are no longer available in the latest registry version correctly
import io from 'socket.io-client';


type Socket = any; // v2 types are different, using any for simplicity in this hook

const SOCKET_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'https://vship-api.perfomax.tech';

// Keep a module-level record of active sockets to prevent multiple initializations 
// and accidental disconnects during rapid React re-mounts.
const activeSockets: Record<string, { socket: Socket; count: number }> = {};

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

    const socketKey = `${vesselId}-${token}`;
    
    // 1. Check if we already have a socket for this vessel/token
    if (activeSockets[socketKey]) {
      activeSockets[socketKey].count++;
      socketRef.current = activeSockets[socketKey].socket;
      setConnected(socketRef.current.connected);
      console.log(`[Socket] Reusing existing connection for Vessel ${vesselId}`);
    } else {
      // 2. Initialize new socket
      console.log(`[Socket] Initializing NEW connection for Vessel ${vesselId}...`);
      const socket = io(SOCKET_URL, {
        transports: ['websocket'],
        reconnectionAttempts: 5,
        query: {
          token,
          vessel_id: String(vesselId),
        },
      });
      
      activeSockets[socketKey] = { socket, count: 1 };
      socketRef.current = socket;
    }

    const socket = socketRef.current!;
    prevVesselRef.current = vesselId;

    // Set up listeners (Socket.io listeners are additive in some versions, but v2 handles .on well)
    // Using .off().on() pattern to ensure we don't double-subscribe if re-mounted
    const onConnect = () => {
      console.log('[Socket] Connected:', socket.id);
      setConnected(true);
    };

    const onDisconnect = (reason: any) => {
      console.warn('[Socket] Disconnected:', reason);
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
      if (activeSockets[socketKey]) {
        activeSockets[socketKey].count--;
        
        // Only actually disconnect and remove listeners if NO components are using this socket
        if (activeSockets[socketKey].count <= 0) {
          console.log(`[Socket] Closing connection for Vessel ${vesselId} (no more subscribers)`);
          socket.disconnect();
          delete activeSockets[socketKey];
        } else {
          console.log(`[Socket] Detaching subscriber from Vessel ${vesselId} (${activeSockets[socketKey].count} left)`);
          // Clean up local listeners to avoid memory leaks if reused
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
