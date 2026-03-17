'use client';

import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'https://socket.perfomax.tech';

export function useSocketData() {
  const [latestME, setLatestME] = useState<Record<string, any>>({});
  const [latestAE, setLatestAE] = useState<Record<string, any>>({});
  const [meTotalCount, setMeTotalCount] = useState(0);
  const [aeTotalCount, setAeTotalCount] = useState(0);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnectionAttempts: 5,
    });

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

    return () => {
      socket.disconnect();
    };
  }, []);

  return { latestME, latestAE, meTotalCount, aeTotalCount, connected };
}
