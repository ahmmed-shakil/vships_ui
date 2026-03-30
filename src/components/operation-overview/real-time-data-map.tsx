'use client';

import { formatDistanceToNowStrict } from 'date-fns';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface RealTimeDataMapProps {
  /** Vessel name shown in popup */
  name?: string;
  /** Latitude */
  lat: number;
  /** Longitude */
  long: number;
  /** Vessel heading in degrees */
  direction?: number;
  /** Position timestamp in **seconds** (unix) */
  timestamp: number;
  /** CSS height value */
  minHeight?: number | string;
}

// ─── MapUpdater ──────────────────────────────────────────────────────────────

function MapUpdater({
  position,
  lastSeen,
}: {
  position: [number, number];
  lastSeen: number;
}) {
  const map = useMap();
  useEffect(() => {
    try {
      map.invalidateSize();
    } catch {
      // map container not ready yet
    }
    const timer = setTimeout(() => {
      try {
        map.invalidateSize();
      } catch {
        // map container not ready yet
      }
    }, 400);
    if (position[0] && position[1]) {
      try {
        map.setView(position, map.getZoom());
      } catch {
        // map not fully initialized yet
      }
    }
    return () => clearTimeout(timer);
  }, [map, position, lastSeen]);
  return null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function colorByRecency(timestampMs: number): string {
  const diff = Date.now() - timestampMs;
  const FIVE_MIN = 5 * 60 * 1000;
  const THREE_HR = 3 * 60 * 60 * 1000;
  if (diff < FIVE_MIN) return '#4ade80'; // dynamic green
  if (diff < THREE_HR) return '#facc15'; // yellow
  return '#f87171'; // red
}

function createArrowIcon(
  name: string,
  direction: number,
  timestampMs: number
) {
  const color = colorByRecency(timestampMs);
  const diff = Date.now() - timestampMs;
  const shouldPulse = diff < 3 * 60 * 60 * 1000;

  return L.divIcon({
    className: 'real-time-data-marker',
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;">
        <div style="position:relative;">
          ${
            shouldPulse
              ? `<div style="
                  position:absolute;top:50%;left:50%;
                  transform:translate(-50%,-50%);
                  width:30px;height:30px;
                  background-color:${color};
                  border-radius:50%;opacity:0;
                  animation:rtDataPulse 2s ease-out infinite;
                "></div>`
              : ''
          }
          <div style="
            position:relative;width:20px;height:20px;
            transform:rotate(${direction}deg);
          ">
            <div style="
              position:absolute;top:0;left:0;width:100%;height:100%;
              clip-path:polygon(50% 0%, 85% 100%, 50% 85%, 15% 100%);
              background-color:${color};
              filter:drop-shadow(0 2px 2px rgba(0,0,0,0.2));
            "></div>
          </div>
        </div>
        <div style="
          background:${color};color:#fff;
          padding:2px 8px;border-radius:4px;
          font-size:11px;font-weight:600;
          box-shadow:0 2px 8px rgba(0,0,0,0.15);
          margin-top:4px;text-align:center;
          white-space:nowrap;
        ">${name}</div>
      </div>
    `,
  });
}

// ─── Inject global styles once ───────────────────────────────────────────────

let stylesInjected = false;
function injectStyles() {
  if (stylesInjected || typeof document === 'undefined') return;
  stylesInjected = true;
  const style = document.createElement('style');
  style.textContent = `
    @keyframes rtDataPulse {
      0%   { transform: translate(-50%,-50%) scale(0.5); opacity: 0.8; }
      100% { transform: translate(-50%,-50%) scale(1.5); opacity: 0;   }
    }
    .real-time-data-marker {
      background: transparent !important;
      border: none !important;
    }
  `;
  document.head.appendChild(style);
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function RealTimeDataMap({
  name = 'Demo Vessel',
  lat,
  long,
  direction = 0,
  timestamp,
  minHeight = 400,
}: RealTimeDataMapProps) {
  useEffect(() => injectStyles(), []);

  const mapRef = useRef<L.Map | null>(null);
  const position: [number, number] = [lat, long];
  const lastSeenMs = timestamp * 1000;

  const height = typeof minHeight === 'number' ? `${minHeight}px` : minHeight;

  return (
    <div id="real-time-data-map" style={{ height: '100%' }}>
      <MapContainer
        center={position}
        zoom={5}
        scrollWheelZoom
        zoomControl
        ref={mapRef}
        style={{
          minHeight: height,
          height: '100%',
          borderRadius: '0.75rem',
        }}
      >
        <MapUpdater position={position} lastSeen={lastSeenMs} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker
          position={position}
          icon={createArrowIcon(name, direction, lastSeenMs)}
        >
          <Popup>
            <strong>{name}</strong>
            <br />
            Timestamp: {new Date(lastSeenMs).toLocaleString('en-US')}
            <br />
            Last seen:{' '}
            {formatDistanceToNowStrict(new Date(lastSeenMs), {
              addSuffix: true,
            })}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
