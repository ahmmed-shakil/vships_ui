'use client';

import {
  engineValueToAlarmEngine,
  vesselAlarmData as fallbackAlarmData,
  type AlarmEntry,
} from '@/data/nura/alarm-data';
import { formatDistanceToNowStrict } from 'date-fns';
import { emissionZones as fallbackEmissionZones } from '@/data/nura/emission-zones';
import type { FleetVessel } from '@/data/nura/fleet-data';
import { engineData, shipData } from '@/data/nura/ships';
import * as api from '@/services/api';
import {
  selectedEngineAtom,
  selectedShipAtom,
} from '@/store/condition-monitoring-atoms';
import { useSetAtom } from 'jotai';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import {
  PiArrowRight,
  PiBellSimpleRingingFill,
  PiEngine,
  PiLightningFill,
  PiNavigationArrow,
  PiWifiHigh,
} from 'react-icons/pi';
import {
  MapContainer,
  Marker,
  Polygon,
  Popup,
  TileLayer,
  useMap,
  ZoomControl,
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
  dg1?: number;
  dg2?: number;
  dg3?: number;
  dg4?: number;
  dg5?: number;
  dg6?: number;
}

interface VesselMapProps {
  vessels: FleetVessel[];
  minHeight?: number | string;
  alarmData?: Record<number, AlarmEntry[]>;
  emissionZoneData?: typeof fallbackEmissionZones;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toPoints(vessels: FleetVessel[]): VesselPoint[] {
  return vessels
    .filter((v) => v.position?.lat != null && v.position?.long != null)
    .map((v) => ({
      name: v.name,
      position: [v.position.lat, v.position.long] as [number, number],
      timestamp: v.position.timestamp * 1000,
      direction: v.position.direction,
      position_status: v.position_status,
      vessel_id: v.vessel_id, // Fixed v.id back to v.vessel_id as per FleetVessel
      online: v.online * 1000,
      me1: v.me1 * 1000,
      me2: v.me2 * 1000,
      me3: v.me3 * 1000,
      ae1: v.ae1 * 1000,
      ae2: v.ae2 * 1000,
      dg1: (v.engines?.DG1 ?? v.engines?.dg1 ?? 0) * 1000,
      dg2: (v.engines?.DG2 ?? v.engines?.dg2 ?? 0) * 1000,
      dg3: (v.engines?.DG3 ?? v.engines?.dg3 ?? 0) * 1000,
      dg4: (v.engines?.DG4 ?? v.engines?.dg4 ?? 0) * 1000,
      dg5: (v.engines?.DG5 ?? v.engines?.dg5 ?? 0) * 1000,
      dg6: (v.engines?.DG6 ?? v.engines?.dg6 ?? 0) * 1000,
    }));
}

function colorByRecency(timestampMs: number): string {
  const diff = Date.now() - timestampMs;
  const FIVE_MIN = 5 * 60 * 1000;
  const THREE_HR = 3 * 60 * 60 * 1000;
  if (diff < FIVE_MIN) return '#4ade80';
  if (diff < THREE_HR) return '#facc15';
  return '#f87171';
}

// ─── Vessel marker icon (divIcon) ────────────────────────────────────────────

function createVesselIcon(name: string, direction: number, onlineMs: number) {
  const color = colorByRecency(onlineMs);
  const diff = Date.now() - onlineMs;
  const shouldPulse = diff < 3 * 60 * 60 * 1000;

  return L.divIcon({
    className: 'vessel-marker-div',
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

// ─── MapUpdater (runs only on mount to avoid repositioning) ──────────────────

function MapUpdater({ position }: { position: [number, number] }) {
  const map = useMap();
  const hasInitialized = React.useRef(false);
  useEffect(() => {
    if (!hasInitialized.current && position[0] && position[1]) {
      map.setView(position, map.getZoom());
      hasInitialized.current = true;
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
    
    /* ─── Leaflet Popup Customizations ─── */
    .vessel-custom-popup .leaflet-popup-content-wrapper {
      background: #1A1C23;
      color: #fff;
      border-radius: 12px;
      padding: 4px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      border: 1px solid rgba(255,255,255,0.1);
    }
    .vessel-custom-popup .leaflet-popup-tip {
      background: #1A1C23;
      border: 1px solid rgba(255,255,255,0.1);
      border-top: none;
      border-left: none;
    }
    .vessel-custom-popup .leaflet-popup-close-button {
      color: #aaa !important;
      padding: 8px 12px 0 0 !important;
    }
    .vessel-custom-popup .leaflet-popup-close-button:hover {
      color: #fff !important;
    }

    /* Weather toggle panel */
    .weather-control-panel {
      position: absolute;
      top: 15px;
      right: 60px;
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
  alarmData = fallbackAlarmData as Record<number, AlarmEntry[]>,
  emissionZoneData = fallbackEmissionZones,
}: VesselMapProps) {
  const vesselAlarmData = alarmData;
  const emissionZones = emissionZoneData;
  useEffect(() => injectStyles(), []);

  const router = useRouter();
  const setShip = useSetAtom(selectedShipAtom);
  const setEngine = useSetAtom(selectedEngineAtom);

  const handleConditionMonitoringClick = async (v: VesselPoint) => {
    // Use the real API vessel list so the Helium header selects the correct vessel
    // (instead of the hardcoded demo `shipData`).
    try {
      const vessels = await api.fetchVessels();
      const ship = vessels.find((s) => s.id === v.vessel_id);
      if (ship) setShip(ship);
      else {
        setShip({
          id: v.vessel_id,
          label: v.name,
          value: String(v.vessel_id),
          engines: [],
          position: {
            lat: v.position[0],
            long: v.position[1],
            direction: v.direction,
            timestamp: Math.floor(v.timestamp / 1000),
          },
        });
      }
    } catch {
      setShip({
        id: v.vessel_id,
        label: v.name,
        value: String(v.vessel_id),
        engines: [],
        position: {
          lat: v.position[0],
          long: v.position[1],
          direction: v.direction,
          timestamp: Math.floor(v.timestamp / 1000),
        },
      });
    } finally {
      router.push('machinery/condition-monitoring');
    }
  };

  const handleEngineClick = async (v: VesselPoint, engineValue: string) => {
    try {
      const vessels = await api.fetchVessels();
      const ship = vessels.find((s) => s.id === v.vessel_id);
      if (ship) setShip(ship);
      else {
        setShip({
          id: v.vessel_id,
          label: v.name,
          value: String(v.vessel_id),
          engines: [],
          position: {
            lat: v.position[0],
            long: v.position[1],
            direction: v.direction,
            timestamp: Math.floor(v.timestamp / 1000),
          },
        });
      }
    } catch {
      setShip({
        id: v.vessel_id,
        label: v.name,
        value: String(v.vessel_id),
        engines: [],
        position: {
          lat: v.position[0],
          long: v.position[1],
          direction: v.direction,
          timestamp: Math.floor(v.timestamp / 1000),
        },
      });
    }

    const engineOpt = engineData.find((e) => e.value === engineValue);
    if (engineOpt) setEngine(engineOpt);
    router.push('/real-time-data');
  };

  const [showEmissions, setShowEmissions] = useState(true);
  const [activeWeather, setActiveWeather] = useState<Set<WeatherLayerId>>(
    new Set()
  );

  const toggleWeather = (id: WeatherLayerId) => {
    setActiveWeather((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const vessels = toPoints(rawVessels);
  const center: [number, number] = [20, 0];

  return (
    <div id="vessel-map" style={{ position: 'relative' }}>
      <MapContainer
        center={center}
        zoom={3}
        minZoom={3} // Restrict how much the map can be zoomed out
        maxZoom={18}
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
          noWrap={true} // Prevents the map from repeating horizontally
        />

        {/* ── Weather overlay tiles ── */}
        {weatherLayers.map(
          (wl) =>
            activeWeather.has(wl.id) && (
              <TileLayer
                key={wl.id}
                url={`https://tile.openweathermap.org/map/${wl.layer}/{z}/{x}/{y}.png?appid=${OWM_KEY}`}
                opacity={0.6}
                noWrap={true}
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
        {vessels.map((v, idx) => {
          const shipMeta = shipData.find((s) => s.id === v.vessel_id);
          const totalAlarms =
            vesselAlarmData[v.vessel_id]?.filter((a) => a.status === 'active')
              .length || 0;
          const criticalAlarms =
            vesselAlarmData[v.vessel_id]?.filter(
              (a) => a.status === 'active' && a.severity === 1
            ).length || 0;

          return (
            <Marker
              key={idx}
              position={v.position}
              icon={createVesselIcon(v.name, v.direction, v.timestamp)}
              eventHandlers={{
                mouseover: (e) => e.target.openPopup(),
              }}
            >
              <Popup className="vessel-custom-popup">
                <div className="flex min-w-[280px] flex-col text-gray-100">
                  {/* Header Row */}
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <strong className="text-lg font-semibold tracking-wide text-white">
                        {v.name}
                      </strong>
                      <span className="rounded-full border border-yellow-600/50 bg-yellow-600/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-yellow-500">
                        {v.position_status}
                      </span>
                    </div>
                    {totalAlarms > 0 && (
                      <span className="flex items-center gap-1 rounded-full border border-red-900/50 bg-red-950/40 px-2 py-0.5 text-[11px] font-medium text-red-500">
                        <PiBellSimpleRingingFill className="h-3 w-3" />
                        {totalAlarms} alarms
                      </span>
                    )}
                  </div>

                  {/* Position info */}
                  <div className="mb-4 flex flex-col gap-1 border-b border-gray-700/50 pb-4 text-xs text-gray-200">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground">Position</span>
                      <span className="font-mono text-muted-foreground">
                        {v.position[0].toFixed(4)}° N,{' '}
                        {v.position[1].toFixed(4)}° E
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground">
                        Last data received
                      </span>
                      <span className="font-semibold text-muted-foreground">
                        {formatDistanceToNowStrict(new Date(v.online))} ago
                      </span>
                    </div>
                  </div>

                  {/* System Status header & legend */}
                  <div className="mb-3 flex flex-col">
                    <span className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      System Status
                    </span>
                    <div className="flex items-center gap-3 text-[9px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-400"></span>{' '}
                        {'< 5 min / Good'}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-yellow-400"></span>{' '}
                        {'5–30 min / Warn'}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-400"></span>{' '}
                        {'> 30 min / Alert'}
                      </span>
                    </div>
                  </div>

                  {/* Icon Grid */}
                  <div className="mb-5 flex flex-wrap gap-4">
                    {/* Internet */}
                    <div className="flex w-[42px] flex-col items-center gap-1.5">
                      <div
                        className="relative flex h-10 w-10 items-center justify-center rounded-full border"
                        style={{
                          backgroundColor: colorByRecency(v.online),
                          borderColor: colorByRecency(v.online),
                          boxShadow: `0 0 10px ${colorByRecency(v.online)}50`,
                        }}
                      >
                        <PiWifiHigh
                          className="h-5 w-5 drop-shadow-md"
                          style={{ color: '#fff' }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        Internet
                      </span>
                    </div>

                    {/* GPS */}
                    <div className="flex w-[42px] flex-col items-center gap-1.5">
                      <div
                        className="relative flex h-10 w-10 items-center justify-center rounded-full border"
                        style={{
                          backgroundColor: colorByRecency(v.timestamp),
                          borderColor: colorByRecency(v.timestamp),
                          boxShadow: `0 0 10px ${colorByRecency(v.timestamp)}50`,
                        }}
                      >
                        <PiNavigationArrow
                          className="h-5 w-5 drop-shadow-md"
                          style={{ color: '#fff' }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        GPS
                      </span>
                    </div>

                    <div className="mx-1 h-12 w-[1px] bg-gray-700/50"></div>

                    {/* Engines */}
                    {(
                      [
                        {
                          key: 'me1',
                          label: 'ME1',
                          objKey: 'me1',
                          icon: PiEngine,
                        },
                        {
                          key: 'me2',
                          label: 'ME2',
                          objKey: 'me2',
                          icon: PiEngine,
                        },
                        {
                          key: 'me3',
                          label: 'ME3',
                          objKey: 'me3',
                          icon: PiEngine,
                        },
                        {
                          key: 'ae1',
                          label: 'AE1',
                          objKey: 'ae1',
                          icon: PiLightningFill,
                        },
                        {
                          key: 'ae2',
                          label: 'AE2',
                          objKey: 'ae2',
                          icon: PiLightningFill,
                        },
                        {
                          key: 'dg1',
                          label: 'DG1',
                          objKey: 'dg1',
                          icon: PiEngine,
                        },
                        {
                          key: 'dg2',
                          label: 'DG2',
                          objKey: 'dg2',
                          icon: PiEngine,
                        },
                        {
                          key: 'dg3',
                          label: 'DG3',
                          objKey: 'dg3',
                          icon: PiEngine,
                        },
                        {
                          key: 'dg4',
                          label: 'DG4',
                          objKey: 'dg4',
                          icon: PiEngine,
                        },
                        {
                          key: 'dg5',
                          label: 'DG5',
                          objKey: 'dg5',
                          icon: PiEngine,
                        },
                        {
                          key: 'dg6',
                          label: 'DG6',
                          objKey: 'dg6',
                          icon: PiEngine,
                        },
                      ] as const
                    ).map(({ key, label, objKey, icon: Icon }) => {
                      // Find engine alarms
                      const eqEngineId = key;
                      const eqAlarmEngine =
                        engineValueToAlarmEngine[eqEngineId];

                      let engineAlarms = 0;
                      if (eqAlarmEngine && vesselAlarmData[v.vessel_id]) {
                        engineAlarms = vesselAlarmData[v.vessel_id].filter(
                          (a) =>
                            a.status === 'active' && a.engine === eqAlarmEngine
                        ).length;
                      }
                      // Force me1, me2, ae1 to green for demo
                      const isForcedGreen =
                        key === 'me1' || key === 'me2' || key === 'ae1';
                      const engineTimeColor = isForcedGreen
                        ? '#4ade80'
                        : colorByRecency((v as any)[objKey] ?? 0);
                      const hasCritical = vesselAlarmData[v.vessel_id]?.some(
                        (a) =>
                          a.status === 'active' &&
                          a.engine === eqAlarmEngine &&
                          a.severity === 1
                      );
                      let finalColor = engineTimeColor;
                      if (
                        !isForcedGreen &&
                        hasCritical &&
                        finalColor === '#4ade80'
                      )
                        finalColor = '#facc15'; // Warn if critical alarms exist but data is fresh

                      if (((v as any)[objKey] ?? 0) === 0) return null; // No engine mapping (e.g. ship without AE2/ME3/DG*)

                      return (
                        <div
                          key={key}
                          className="group flex w-[42px] cursor-pointer flex-col items-center gap-1.5"
                          onClick={() => handleEngineClick(v, eqEngineId)}
                        >
                          <div
                            className="relative flex h-10 w-10 items-center justify-center rounded-full border transition-colors group-hover:opacity-90"
                            style={{
                              backgroundColor: finalColor,
                              borderColor: finalColor,
                              boxShadow: `0 0 10px ${finalColor}50`,
                            }}
                          >
                            <Icon
                              className="h-5 w-5 drop-shadow-md"
                              style={{ color: '#fff' }}
                            />
                            {engineAlarms > 0 && (
                              <div className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full border border-[#1e1e1e] bg-red-400 text-[9px] font-bold text-white">
                                {engineAlarms > 9 ? '9+' : engineAlarms}
                              </div>
                            )}
                          </div>
                          <span className="text-[10px] text-muted-foreground transition-colors group-hover:text-white">
                            {label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Critical alarms banner */}
                  {criticalAlarms > 0 && (
                    <div className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg border border-red-900/50 bg-red-950/30 py-2.5 text-[11px] font-medium text-red-500">
                      <PiBellSimpleRingingFill className="h-3.5 w-3.5" />
                      {criticalAlarms} critical alarm
                      {criticalAlarms !== 1 ? 's' : ''} in the last 5 hours
                    </div>
                  )}

                  {/* Action button */}
                  <button
                    onClick={() => handleConditionMonitoringClick(v)}
                    className="flex w-full items-center justify-between rounded-lg border border-blue-800/50 bg-blue-900/40 px-4 py-2.5 text-[13px] font-semibold text-blue-400 transition-colors hover:bg-blue-800/50"
                  >
                    View Condition Monitoring
                    <PiArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
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
        {/* {weatherLayers.map((wl) => (
          <label key={wl.id}>
            <input
              type="checkbox"
              checked={activeWeather.has(wl.id)}
              onChange={() => toggleWeather(wl.id)}
            />
            {wl.label}
          </label>
        ))} */}
      </div>
    </div>
  );
}
