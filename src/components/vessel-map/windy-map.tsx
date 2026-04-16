'use client';

import {
  engineValueToAlarmEngine,
  vesselAlarmData as fallbackAlarmData,
  type AlarmEntry,
} from '@/data/nura/alarm-data';
import type { FleetVessel } from '@/data/nura/fleet-data';
import * as api from '@/services/api';
import {
  selectedEngineAtom,
  selectedShipAtom,
} from '@/store/condition-monitoring-atoms';
import { formatDistanceToNowStrict } from 'date-fns';
import { useSetAtom } from 'jotai';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  PiArrowRight,
  PiBellSimpleRingingFill,
  PiEngine,
  PiLightningFill,
  PiNavigationArrow,
  PiWifiHigh
} from 'react-icons/pi';

// Declare global window types for Leaflet and Windy
declare global {
  interface Window {
    L: any;
    windyInit: any;
  }
}

interface WindyMapProps {
  vessels: FleetVessel[];
  minHeight?: number | string;
  apiKey: string;
  alarmData?: Record<number, AlarmEntry[]>;
}

const OVERLAY_OPTIONS = [
  { value: 'wind', label: 'Wind', icon: '💨' },
  // { value: 'gust', label: 'Wind Gusts', icon: '🌬️' },
  // { value: 'rain', label: 'Rain', icon: '🌧️' },
  { value: 'temp', label: 'Temperature', icon: '🌡️' },
  { value: 'pressure', label: 'Pressure', icon: '🔵' },
  // { value: 'clouds', label: 'Clouds', icon: '☁️' },
  // { value: 'waves', label: 'Waves', icon: '🌊' },
  // { value: 'swell', label: 'Swell', icon: '🌊' },
  // { value: 'currents', label: 'Currents', icon: '🔄' },
];

function colorByRecency(timestampSec: number): string {
  const diff = Date.now() - timestampSec * 1000;
  const FIVE_MIN = 5 * 60 * 1000;
  const THREE_HR = 3 * 60 * 60 * 1000;
  if (diff < FIVE_MIN) return '#4ade80';
  if (diff < THREE_HR) return '#facc15';
  return '#f87171';
}

export default function WindyMap({
  vessels,
  minHeight = 300,
  apiKey,
  alarmData = fallbackAlarmData as Record<number, AlarmEntry[]>,
}: WindyMapProps): React.JSX.Element {
  const vesselAlarmData = alarmData;
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const windyStoreRef = useRef<any>(null);

  const router = useRouter();
  const setShip = useSetAtom(selectedShipAtom);
  const setEngine = useSetAtom(selectedEngineAtom);

  const handleConditionMonitoringClick = async (v: FleetVessel) => {
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
            lat: v.position.lat,
            long: v.position.long,
            direction: v.position.direction,
            timestamp: v.position.timestamp,
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
          lat: v.position.lat,
          long: v.position.long,
          direction: v.position.direction,
          timestamp: v.position.timestamp,
        },
      });
    } finally {
      router.push('/machinery/condition-monitoring');
    }
  };

  const handleEngineClick = async (v: FleetVessel, engineValue: string) => {
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
            lat: v.position.lat,
            long: v.position.long,
            direction: v.position.direction,
            timestamp: v.position.timestamp,
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
          lat: v.position.lat,
          long: v.position.long,
          direction: v.position.direction,
          timestamp: v.position.timestamp,
        },
      });
    }

    const normalizedValue = engineValue.toLowerCase();
    setEngine({
      value: normalizedValue,
      label: normalizedValue.toUpperCase(),
    });
    router.push('/real-time-data');
  };

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [selectedOverlay, setSelectedOverlay] = useState('wind');

  const [vesselPositions, setVesselPositions] = useState<{
    [key: number]: { x: number; y: number };
  }>({});
  const [activePopup, setActivePopup] = useState<number | null>(null);

  const [mapBounds, setMapBounds] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  // Get the map container's position for the portal overlay
  useEffect(() => {
    const updateBounds = () => {
      if (mapContainer.current) {
        const rect = mapContainer.current.getBoundingClientRect();
        setMapBounds({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
        });
      }
    };

    updateBounds();
    window.addEventListener('resize', updateBounds);
    return () => {
      window.removeEventListener('resize', updateBounds);
    };
  }, [mapReady]);

  // Handle layer overlay change
  useEffect(() => {
    if (windyStoreRef.current && mapReady) {
      try {
        windyStoreRef.current.set('overlay', selectedOverlay);
      } catch (e) {
        console.error(`Failed to switch overlay to ${selectedOverlay}:`, e);
      }
    }
  }, [selectedOverlay, mapReady]);

  const hasCenteredRef = useRef(false);
  useEffect(() => {
    if (!mapRef.current || !mapReady || hasCenteredRef.current) return;
    if (vessels?.length > 0) {
      const v = vessels.find(
        (v) => v.position?.lat != null && v.position?.long != null
      );
      if (v) {
        mapRef.current.setView(
          [v.position.lat, v.position.long],
          mapRef.current.getZoom()
        );
        hasCenteredRef.current = true;
      }
    }
  }, [mapReady, vessels]);

  // Update vessel positions when map moves or zooms
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;
    const map = mapRef.current;

    const handleMapMove = () => {
      if (!mapRef.current || !vessels?.length) return;
      const newPositions: { [key: number]: { x: number; y: number } } = {};
      vessels
        .filter((v) => v.position?.lat != null && v.position?.long != null)
        .forEach((vessel) => {
          const point = mapRef.current.latLngToContainerPoint([
            vessel.position.lat,
            vessel.position.long,
          ]);
          newPositions[vessel.vessel_id] = { x: point.x, y: point.y };
        });
      setVesselPositions(newPositions);
    };

    const handleMapClick = () => {
      setActivePopup(null);
    };

    handleMapMove();
    map.on('move', handleMapMove);
    map.on('zoom', handleMapMove);
    map.on('moveend', handleMapMove);
    map.on('zoomend', handleMapMove);
    map.on('resize', handleMapMove);
    map.on('click', handleMapClick);

    return () => {
      map.off('move', handleMapMove);
      map.off('zoom', handleMapMove);
      map.off('moveend', handleMapMove);
      map.off('zoomend', handleMapMove);
      map.off('resize', handleMapMove);
      map.off('click', handleMapClick);
    };
  }, [mapReady, vessels]);

  // Script loading
  const loadScript = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        return resolve();
      }
      const script = document.createElement('script');
      script.src = src;
      script.async = false;
      script.onload = () => resolve();
      script.onerror = (e) => reject(e);
      document.head.appendChild(script);
    });
  };

  useEffect(() => {
    if (mapReady) return;
    setIsLoading(true);

    const initWindy = async () => {
      try {
        // Load Leaflet CSS
        if (!document.querySelector('link[href*="leaflet@1.4.0"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.4.0/dist/leaflet.css';
          document.head.appendChild(link);
        }

        // Add typical Windy overrides
        if (!document.getElementById('windy-custom-styles')) {
          const style = document.createElement('style');
          style.id = 'windy-custom-styles';
          style.innerHTML = `
              #windy #logo-wrapper { opacity: 0; z-index: -9999; }
              #windy #mobile-ovr-select { display: none !important; }
              #windy #bottom { z-index: 600 !important; }
              #windy #legend-mobile {
                display: block !important;
                z-index: 600 !important;
                font-size: 14px !important;
                height: 40px !important;
                line-height: 40px !important;
                max-height: 40px !important;
                width: 100% !important;
                max-width: 600px !important;
                border-radius: 9px !important;
                background: linear-gradient(to right, violet 0%, indigo 14%, blue 28%, green 42%, yellow 57%, orange 71%, red 85%, red 100%);
                position: relative;
                margin-bottom: 20px !important;
              }
              #windy .bottom-border {
                z-index: 600 !important;
              }
            `;
          document.head.appendChild(style);
        }

        await loadScript('https://unpkg.com/leaflet@1.4.0/dist/leaflet.js');
        await loadScript(
          'https://api.windy.com/assets/map-forecast/libBoot.js'
        );

        // Check if map container is ready
        if (!mapContainer.current) return;

        // Windy init loop
        let attempts = 0;
        const checkWindy = setInterval(() => {
          if (typeof window.windyInit !== 'undefined') {
            clearInterval(checkWindy);

            // Determine initial center from first vessel if available
            const firstVessel = vessels.find(
              (v) => v.position?.lat != null && v.position?.long != null
            );
            const startLat = firstVessel?.position.lat ?? 1.25;
            const startLon = firstVessel?.position.long ?? 103.85;

            window.windyInit(
              {
                key: apiKey,
                lat: startLat,
                lon: startLon,
                zoom: 7,
                lang: 'en',
                overlay: 'wind',
              },
              (windyAPI: any) => {
                const { map, store } = windyAPI;
                windyStoreRef.current = store;
                mapRef.current = map;

                // Set high zindex so standard components match
                const markerPane = map.getPane('markerPane');
                if (markerPane) markerPane.style.zIndex = '1000';

                setMapReady(true);
                setIsLoading(false);
              }
            );
          } else {
            attempts++;
            if (attempts > 20) {
              clearInterval(checkWindy);
              setError('Failed to load Windy API.');
              setIsLoading(false);
            }
          }
        }, 500);
      } catch (err) {
        setError('Error initializing Windy map scripts.');
        setIsLoading(false);
      }
    };

    initWindy();
  }, [apiKey, mapReady]);

  return (
    <div style={{ position: 'relative', width: '100%', height: minHeight }}>
      {/* Overlay Selector */}
      <div className="absolute right-14 top-4 z-[1001] flex min-w-[150px] flex-col rounded-lg bg-white/95 p-2 shadow-md">
        <label className="mb-1 text-[11px] font-bold text-gray-800">
          Weather Layer
        </label>
        <select
          value={selectedOverlay}
          onChange={(e) => setSelectedOverlay(e.target.value)}
          className="w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-[13px] text-gray-800 outline-none"
        >
          {OVERLAY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.icon} {opt.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading && (
        <div className="absolute inset-0 z-[1000] flex flex-col items-center justify-center rounded-[10px] bg-white/80">
          <div className="mb-2 font-bold text-gray-700">Loading map...</div>
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500"></div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 z-[1000] flex flex-col items-center justify-center rounded-[10px] bg-white/80">
          <div className="font-bold text-red-500">{error}</div>
        </div>
      )}

      {/* Windy Map Container */}
      <div
        id="windy"
        ref={mapContainer}
        style={{ width: '100%', height: '100%', borderRadius: '10px' }}
      ></div>

      {/* React-based vessel overlay using Portal */}
      {mapReady &&
        mapBounds &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            style={{
              position: 'absolute',
              top: mapBounds.top,
              left: mapBounds.left,
              width: mapBounds.width,
              height: mapBounds.height,
              pointerEvents: 'none',
              zIndex: 999999,
              overflow: 'hidden',
            }}
          >
            {vessels.map((vessel) => {
              const pos = vesselPositions[vessel.vessel_id];
              if (!pos) return null;

              const color = colorByRecency(vessel.position?.timestamp ?? 0);
              const diff =
                Date.now() - (vessel.position?.timestamp ?? 0) * 1000;
              const shouldPulse = diff < 3 * 60 * 60 * 1000;

              const totalAlarms =
                vesselAlarmData[vessel.vessel_id]?.filter(
                  (a) => a.status === 'active'
                ).length || 0;
              const criticalAlarms =
                vesselAlarmData[vessel.vessel_id]?.filter(
                  (a) => a.status === 'active' && a.severity === 1
                ).length || 0;

              return (
                <div
                  key={vessel.vessel_id}
                  style={{
                    position: 'absolute',
                    left: pos.x,
                    top: pos.y,
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'auto',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={() => {
                    setActivePopup(vessel.vessel_id);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePopup(vessel.vessel_id);
                  }}
                >
                  {/* Marker Icon */}
                  <div className="relative flex flex-col items-center">
                    {shouldPulse && (
                      <div
                        className="absolute left-1/2 top-1/2 h-[30px] w-[30px] -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full opacity-75"
                        style={{ backgroundColor: color }}
                      />
                    )}
                    <div
                      style={{
                        position: 'relative',
                        width: '20px',
                        height: '20px',
                        transform: `rotate(${vessel.position.direction}deg)`,
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          clipPath:
                            'polygon(50% 0%, 85% 100%, 50% 85%, 15% 100%)',
                          backgroundColor: color,
                          filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.2))',
                        }}
                      />
                    </div>
                    <div
                      className="mt-0.5 whitespace-nowrap rounded px-2 py-0.5 text-[11px] font-bold text-white shadow-sm"
                      style={{ backgroundColor: color }}
                    >
                      {vessel.name}
                    </div>
                  </div>

                  {/* Popup */}
                  {activePopup === vessel.vessel_id && (
                    <div className="absolute bottom-full left-1/2 mb-4 min-w-[364px] -translate-x-1/2 rounded-xl border border-white/10 bg-[#1A1C23] p-4 text-white shadow-2xl">
                      {/* Header Row */}
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <strong className="text-lg font-semibold tracking-wide text-white">
                            {vessel.name}
                          </strong>
                          <span className="rounded-full border border-yellow-600/50 bg-yellow-600/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-yellow-500">
                            {vessel.position_status}
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
                          <span className="text-gray-400">Position</span>
                          <span className="font-mono text-gray-400">
                            {vessel.position?.lat?.toFixed(4) ?? '—'}° N,{' '}
                            {vessel.position?.long?.toFixed(4) ?? '—'}° E
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-gray-400">
                            Last data received
                          </span>
                          <span className="font-semibold text-gray-400">
                            {formatDistanceToNowStrict(
                              new Date(vessel.online * 1000)
                            )}{' '}
                            ago
                          </span>
                        </div>
                      </div>

                      {/* System Status header & legend */}
                      <div className="mb-3 flex flex-col">
                        <span className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                          System Status
                        </span>
                        <div className="flex items-center gap-3 text-[9px] text-gray-400">
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
                              backgroundColor: colorByRecency(vessel.online),
                              borderColor: colorByRecency(vessel.online),
                              boxShadow: `0 0 10px ${colorByRecency(vessel.online)}50`,
                            }}
                          >
                            <PiWifiHigh
                              className="h-5 w-5 drop-shadow-md"
                              style={{ color: '#fff' }}
                            />
                          </div>
                          <span className="text-[10px] text-gray-400">
                            Internet
                          </span>
                        </div>

                        {/* GPS */}
                        <div className="flex w-[42px] flex-col items-center gap-1.5">
                          <div
                            className="relative flex h-10 w-10 items-center justify-center rounded-full border"
                            style={{
                              backgroundColor: colorByRecency(
                                vessel.position?.timestamp ?? 0
                              ),
                              borderColor: colorByRecency(
                                vessel.position?.timestamp ?? 0
                              ),
                              boxShadow: `0 0 10px ${colorByRecency(vessel.position?.timestamp ?? 0)}50`,
                            }}
                          >
                            <PiNavigationArrow
                              className="h-5 w-5 drop-shadow-md"
                              style={{ color: '#fff' }}
                            />
                          </div>
                          <span className="text-[10px] text-gray-400">GPS</span>
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
                          const engineTimestampSec = objKey.startsWith('dg')
                            ? (vessel.engines?.[
                              `DG${objKey.replace('dg', '')}`
                            ] ?? 0)
                            : ((vessel as any)[objKey] ?? 0);

                          const eqEngineId = key;
                          const eqAlarmEngine =
                            engineValueToAlarmEngine[eqEngineId];

                          let engineAlarms = 0;
                          if (
                            eqAlarmEngine &&
                            vesselAlarmData[vessel.vessel_id]
                          ) {
                            engineAlarms = vesselAlarmData[
                              vessel.vessel_id
                            ].filter(
                              (a) =>
                                a.status === 'active' &&
                                a.engine === eqAlarmEngine
                            ).length;
                          }
                          const isForcedGreen =
                            key === 'me1' || key === 'me2' || key === 'ae1';
                          const engineTimeColor = isForcedGreen
                            ? '#4ade80'
                            : colorByRecency(engineTimestampSec);
                          const hasCritical = vesselAlarmData[
                            vessel.vessel_id
                          ]?.some(
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
                            finalColor = '#facc15';

                          if (engineTimestampSec === 0) return null;

                          return (
                            <div
                              key={key}
                              className="group pointer-events-auto flex w-[42px] cursor-pointer flex-col items-center gap-1.5"
                              onClick={() =>
                                handleEngineClick(vessel, eqEngineId)
                              }
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
                              <span className="text-[10px] text-gray-400 transition-colors group-hover:text-white">
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
                        onClick={() => handleConditionMonitoringClick(vessel)}
                        className="pointer-events-auto flex w-full items-center justify-between rounded-lg border border-blue-800/50 bg-blue-900/40 px-4 py-2.5 text-[13px] font-semibold text-blue-400 transition-colors hover:bg-blue-800/50"
                      >
                        View Condition Monitoring
                        <PiArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
}
