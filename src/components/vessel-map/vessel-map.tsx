'use client';

import { emissionZones } from '@/data/nura/emission-zones';
import type { FleetVessel } from '@/data/nura/fleet-data';
import { formatDistanceToNowStrict } from 'date-fns';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import {
    MapContainer,
    Marker,
    Polygon,
    Popup,
    TileLayer,
    useMap,
    ZoomControl
} from 'react-leaflet';

// ─── Types ───────────────────────────────────────────────────────────────────

interface VesselPoint {
    position: [number, number];
    timestamp: number; // ms
    direction: number;
    name: string;
    position_status: string;
    vessel_id: number;
    online: number;
    me1: number;
    me2: number;
    me3: number;
    ae1: number;
    ae2: number;
}

interface VesselMapProps {
    vessels: FleetVessel[];
    minHeight?: number | string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toPoints(vessels: FleetVessel[]): VesselPoint[] {
    return vessels.map((v) => ({
        name: v.name,
        position: [v.position.lat, v.position.long] as [number, number],
        timestamp: v.position.timestamp * 1000,
        direction: v.position.direction,
        position_status: v.position_status,
        vessel_id: v.vessel_id,
        online: v.online * 1000,
        me1: v.me1 * 1000,
        me2: v.me2 * 1000,
        me3: v.me3 * 1000,
        ae1: v.ae1 * 1000,
        ae2: v.ae2 * 1000,
    }));
}

function colorByRecency(timestampMs: number): string {
    const diff = Date.now() - timestampMs;
    const FIVE_MIN = 5 * 60 * 1000;
    const THREE_HR = 3 * 60 * 60 * 1000;
    if (diff < FIVE_MIN) return '#28a745';
    if (diff < THREE_HR) return '#ffc107';
    return '#dc3545';
}

// ─── Vessel marker icon (divIcon) ────────────────────────────────────────────

function createVesselIcon(name: string, direction: number, timestampMs: number) {
    const color = colorByRecency(timestampMs);
    const diff = Date.now() - timestampMs;
    const shouldPulse = diff < 3 * 60 * 60 * 1000;

    return L.divIcon({
        className: 'vessel-marker-div',
        html: `
      <div style="display:flex;flex-direction:column;align-items:center;">
        <div style="position:relative;">
          ${shouldPulse
                ? `<div style="
                  position:absolute;top:50%;left:50%;
                  transform:translate(-50%,-50%);
                  width:30px;height:30px;
                  background-color:${color};
                  border-radius:50%;opacity:0;
                  animation:vesselPulse 2s ease-out infinite;
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
          padding:4px 12px;border-radius:6px;
          font-size:13px;font-weight:600;
          box-shadow:0 2px 8px rgba(0,0,0,0.15);
          margin-top:6px;text-align:center;
          max-width:200px;white-space:nowrap;min-width:40px;
        ">${name}</div>
      </div>
    `,
    });
}

// ─── MapUpdater ──────────────────────────────────────────────────────────────

function MapUpdater({ position }: { position: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        if (position[0] && position[1]) {
            map.setView(position, map.getZoom());
        }
    }, [map, position]);
    return null;
}

// ─── Inject global styles ────────────────────────────────────────────────────

let stylesInjected = false;
function injectStyles() {
    if (stylesInjected || typeof document === 'undefined') return;
    stylesInjected = true;
    const style = document.createElement('style');
    style.textContent = `
    @keyframes vesselPulse {
      0%   { transform: translate(-50%,-50%) scale(0.5); opacity: 0.8; }
      100% { transform: translate(-50%,-50%) scale(1.5); opacity: 0;   }
    }
    .vessel-marker-div {
      background: transparent !important;
      border: none !important;
    }
    /* Weather toggle panel */
    .weather-control-panel {
      position: absolute;
      bottom: 30px;
      left: 12px;
      z-index: 1000;
      background: rgba(255,255,255,0.95);
      backdrop-filter: blur(8px);
      border-radius: 10px;
      padding: 10px 14px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.15);
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-size: 13px;
      font-weight: 500;
      min-width: 160px;
    }
    .weather-control-panel.dark {
      background: rgba(30,30,30,0.92);
      color: #e0e0e0;
    }
    .weather-control-panel label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      user-select: none;
    }
    .weather-control-panel input[type="checkbox"] {
      accent-color: #3B82F6;
      width: 15px;
      height: 15px;
    }
    .weather-control-panel .panel-title {
      font-weight: 700;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      opacity: 0.6;
      margin-bottom: 2px;
    }
  `;
    document.head.appendChild(style);
}

// ─── Status dot ──────────────────────────────────────────────────────────────

function StatusDot({ timestampMs }: { timestampMs: number }) {
    const c = colorByRecency(timestampMs);
    return (
        <span
            style={{
                display: 'inline-block',
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: c,
                marginRight: 4,
                verticalAlign: 'middle',
            }}
        />
    );
}

// ─── Weather layer definitions ───────────────────────────────────────────────

const OWM_KEY = '9de243494c0b295cca9337e1e96b00e2'; // free OpenWeatherMap key

const weatherLayers = [
    { id: 'temp', label: '🌡 Temperature', layer: 'temp_new' },
    { id: 'wind', label: '💨 Wind', layer: 'wind_new' },
    { id: 'pressure', label: '🔵 Pressure', layer: 'pressure_new' },
] as const;

type WeatherLayerId = (typeof weatherLayers)[number]['id'];

// ─── Component ───────────────────────────────────────────────────────────────

export default function VesselMap({
    vessels: rawVessels,
    minHeight = 'calc(100vh - 200px)',
}: VesselMapProps) {
    useEffect(() => injectStyles(), []);

    const [showEmissions, setShowEmissions] = useState(true);
    const [activeWeather, setActiveWeather] = useState<Set<WeatherLayerId>>(new Set());

    const toggleWeather = (id: WeatherLayerId) => {
        setActiveWeather((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const vessels = toPoints(rawVessels);
    const center: [number, number] = vessels.length ? vessels[0].position : [1.29, 103.85];

    return (
        <div id="vessel-map" style={{ position: 'relative' }}>
            <MapContainer
                center={center}
                zoom={9}
                scrollWheelZoom
                zoomControl={false}
                style={{ height: minHeight, width: '100%', borderRadius: '0.75rem' }}
            >
                <ZoomControl position="topright" />
                <MapUpdater position={center} />

                {/* Base tile layer */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* ── Weather overlay tiles ── */}
                {weatherLayers.map(
                    (wl) =>
                        activeWeather.has(wl.id) && (
                            <TileLayer
                                key={wl.id}
                                url={`https://tile.openweathermap.org/map/${wl.layer}/{z}/{x}/{y}.png?appid=${OWM_KEY}`}
                                opacity={0.6}
                            />
                        )
                )}

                {/* ── Emission zone polygons ── */}
                {showEmissions &&
                    emissionZones.map((zone) => (
                        <Polygon
                            key={zone.id}
                            positions={zone.positions}
                            pathOptions={zone.options}
                        />
                    ))}

                {/* ── Vessel markers ── */}
                {vessels.map((v, idx) => (
                    <Marker
                        key={idx}
                        position={v.position}
                        icon={createVesselIcon(v.name, v.direction, v.timestamp)}
                        eventHandlers={{
                            mouseover: (e) => e.target.openPopup(),
                        }}
                    >
                        <Popup>
                            <div style={{ minWidth: 200 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                    <strong style={{ fontSize: 14 }}>{v.name}</strong>
                                    <span
                                        style={{
                                            background: colorByRecency(v.timestamp),
                                            color: '#fff',
                                            borderRadius: 8,
                                            padding: '2px 8px',
                                            fontSize: 11,
                                            fontWeight: 600,
                                        }}
                                    >
                                        {v.position_status}
                                    </span>
                                </div>

                                <div style={{ fontSize: 12, color: '#555', marginBottom: 4 }}>
                                    Position: {new Date(v.timestamp).toLocaleString('en-US')}
                                    <br />
                                    Last seen: {formatDistanceToNowStrict(new Date(v.timestamp))} ago
                                </div>

                                <div
                                    style={{
                                        display: 'flex',
                                        gap: 6,
                                        marginTop: 8,
                                        justifyContent: 'center',
                                        flexWrap: 'wrap',
                                    }}
                                >
                                    <div style={{ textAlign: 'center', fontSize: 10 }}>
                                        <StatusDot timestampMs={v.online} />
                                        <div>WiFi</div>
                                    </div>
                                    <div style={{ textAlign: 'center', fontSize: 10 }}>
                                        <StatusDot timestampMs={v.timestamp} />
                                        <div>GPS</div>
                                    </div>
                                    {(['me1', 'me2', 'me3', 'ae1', 'ae2'] as const).map((key) => (
                                        <div key={key} style={{ textAlign: 'center', fontSize: 10 }}>
                                            <StatusDot timestampMs={v[key]} />
                                            <div>{key.toUpperCase()}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* ── Control panel overlay ── */}
            <div className="weather-control-panel">
                <div className="panel-title">Layers</div>
                <label>
                    <input
                        type="checkbox"
                        checked={showEmissions}
                        onChange={() => setShowEmissions(!showEmissions)}
                    />
                    🌍 Emission Zones
                </label>
                {weatherLayers.map((wl) => (
                    <label key={wl.id}>
                        <input
                            type="checkbox"
                            checked={activeWeather.has(wl.id)}
                            onChange={() => toggleWeather(wl.id)}
                        />
                        {wl.label}
                    </label>
                ))}
            </div>
        </div>
    );
}
