'use client';

import type { FleetVessel } from '@/data/nura/fleet-data';
import { formatDistanceToNowStrict } from 'date-fns';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { PiNavigationArrow, PiWifiHigh, PiArrowRight, PiBellSimpleRingingFill, PiLightningFill, PiEngine, PiEngineFill } from 'react-icons/pi';
import { engineValueToAlarmEngine, vesselAlarmData } from '@/data/nura/alarm-data';
import { useRouter } from 'next/navigation';
import { useSetAtom } from 'jotai';
import { selectedEngineAtom, selectedShipAtom } from '@/store/condition-monitoring-atoms';
import { engineData, shipData } from '@/data/nura/ships';

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

export default function WindyMap({ vessels, minHeight = 300, apiKey }: WindyMapProps): React.JSX.Element {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const windyStoreRef = useRef<any>(null);

  const router = useRouter();
  const setShip = useSetAtom(selectedShipAtom);
  const setEngine = useSetAtom(selectedEngineAtom);

  const handleConditionMonitoringClick = (v: FleetVessel) => {
    const ship = shipData.find((s) => s.id === v.vessel_id);
    if (ship) setShip(ship);
    router.push('/machinery/condition-monitoring');
  };

  const handleEngineClick = (v: FleetVessel, engineValue: string) => {
    const ship = shipData.find((s) => s.id === v.vessel_id);
    const engineOpt = engineData.find((e) => e.value === engineValue);
    if (ship) setShip(ship);
    if (engineOpt) setEngine(engineOpt);
    router.push('/real-time-data');
  };

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [selectedOverlay, setSelectedOverlay] = useState('wind');

  const [vesselPositions, setVesselPositions] = useState<{ [key: number]: { x: number; y: number } }>({});
  const [activePopup, setActivePopup] = useState<number | null>(null);

  const [mapBounds, setMapBounds] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

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

  // Update vessel positions when map moves or zooms
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;
    const map = mapRef.current;

    const handleMapMove = () => {
      if (!mapRef.current || !vessels?.length) return;
      const newPositions: { [key: number]: { x: number; y: number } } = {};
      vessels.forEach((vessel) => {
        const point = mapRef.current.latLngToContainerPoint([
          vessel.position.lat,
          vessel.position.long,
        ]);
        newPositions[vessel.vessel_id] = { x: point.x, y: point.y };
      });
      setVesselPositions(newPositions);
    };

    handleMapMove();
    map.on('move', handleMapMove);
    map.on('zoom', handleMapMove);
    map.on('moveend', handleMapMove);
    map.on('zoomend', handleMapMove);
    map.on('resize', handleMapMove);

    return () => {
      map.off('move', handleMapMove);
      map.off('zoom', handleMapMove);
      map.off('moveend', handleMapMove);
      map.off('zoomend', handleMapMove);
      map.off('resize', handleMapMove);
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
        await loadScript('https://api.windy.com/assets/map-forecast/libBoot.js');

        // Check if map container is ready
        if (!mapContainer.current) return;

        // Windy init loop
        let attempts = 0;
        const checkWindy = setInterval(() => {
          if (typeof window.windyInit !== 'undefined') {
            clearInterval(checkWindy);
            window.windyInit(
              {
                key: apiKey,
                lat: 1.25,
                lon: 103.85,
                zoom: 8,
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
              setError("Failed to load Windy API.");
              setIsLoading(false);
            }
          }
        }, 500);

      } catch (err) {
        setError("Error initializing Windy map scripts.");
        setIsLoading(false);
      }
    };

    initWindy();
  }, [apiKey, mapReady]);

  return (
    <div style={{ position: 'relative', width: '100%', height: minHeight }}>
      {/* Overlay Selector */}
      <div
        className="absolute top-4 right-14 z-[1001] bg-white/95 rounded-lg p-2 shadow-md flex flex-col min-w-[150px]"
      >
        <label className="text-[11px] font-bold mb-1 text-gray-800">Weather Layer</label>
        <select
          value={selectedOverlay}
          onChange={(e) => setSelectedOverlay(e.target.value)}
          className="w-full px-2 py-1.5 rounded border border-gray-300 text-[13px] bg-white text-gray-800 outline-none"
        >
          {OVERLAY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.icon} {opt.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-[1000] rounded-[10px]">
          <div className="mb-2 font-bold text-gray-700">Loading map...</div>
          <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-[1000] rounded-[10px]">
          <div className="text-red-500 font-bold">{error}</div>
        </div>
      )}

      {/* Windy Map Container */}
      <div id="windy" ref={mapContainer} style={{ width: '100%', height: '100%', borderRadius: '10px' }}></div>

      {/* React-based vessel overlay using Portal */}
      {mapReady && mapBounds &&
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

              const color = colorByRecency(vessel.position.timestamp);
              const diff = Date.now() - vessel.position.timestamp * 1000;
              const shouldPulse = diff < 3 * 60 * 60 * 1000;

              const totalAlarms = vesselAlarmData[vessel.vessel_id]?.filter(a => a.status === 'active').length || 0;
              const criticalAlarms = vesselAlarmData[vessel.vessel_id]?.filter(a => a.status === 'active' && a.severity === 1).length || 0;

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
                  onMouseEnter={() => setActivePopup(vessel.vessel_id)}
                  onMouseLeave={() => setActivePopup(null)}
                >
                  {/* Marker Icon */}
                  <div className="relative flex flex-col items-center">
                    {shouldPulse && (
                      <div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30px] h-[30px] rounded-full animate-ping opacity-75"
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
                          clipPath: 'polygon(50% 0%, 85% 100%, 50% 85%, 15% 100%)',
                          backgroundColor: color,
                          filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.2))',
                        }}
                      />
                    </div>
                    <div className="px-2 py-0.5 text-[11px] font-bold text-white shadow-sm mt-0.5 rounded whitespace-nowrap" style={{ backgroundColor: color }}>
                      {vessel.name}
                    </div>
                  </div>

                  {/* Popup */}
                  {activePopup === vessel.vessel_id && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 bg-[#1A1C23] text-white p-4 rounded-xl shadow-2xl border border-white/10 min-w-[364px]">
                      {/* Header Row */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <strong className="text-lg font-semibold tracking-wide text-white">{vessel.name}</strong>
                          <span className="bg-yellow-600/20 text-yellow-500 border border-yellow-600/50 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase">
                            {vessel.position_status}
                          </span>
                        </div>
                        {totalAlarms > 0 && (
                          <span className="flex items-center gap-1 bg-red-950/40 text-red-500 border border-red-900/50 rounded-full px-2 py-0.5 text-[11px] font-medium">
                            <PiBellSimpleRingingFill className="w-3 h-3" />
                            {totalAlarms} alarms
                          </span>
                        )}
                      </div>

                      {/* Position info */}
                      <div className="flex flex-col gap-1 text-xs text-gray-200 mb-4 border-b border-gray-700/50 pb-4">
                        <div className="flex items-center gap-2 justify-between">
                          <span className="text-gray-400">Position</span>
                          <span className="font-mono text-gray-400">{vessel.position.lat.toFixed(4)}° N, {vessel.position.long.toFixed(4)}° E</span>
                        </div>
                        <div className="flex items-center gap-2 justify-between">
                          <span className="text-gray-400">Last data received</span>
                          <span className="font-semibold text-gray-400">2 mins ago</span>
                        </div>
                      </div>

                      {/* System Status header & legend */}
                      <div className="flex flex-col mb-3">
                        <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-2">System Status</span>
                        <div className="flex items-center gap-3 text-[9px] text-gray-400">
                          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400"></span> {'< 5 min / Good'}</span>
                          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span> {'5–30 min / Warn'}</span>
                          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-400"></span> {'> 30 min / Alert'}</span>
                        </div>
                      </div>

                      {/* Icon Grid */}
                      <div className="flex flex-wrap gap-4 mb-5">
                        {/* Internet */}
                        <div className="flex flex-col items-center gap-1.5 w-[42px]">
                          <div className="relative w-10 h-10 rounded-full flex items-center justify-center border" style={{ backgroundColor: colorByRecency(vessel.online), borderColor: colorByRecency(vessel.online), boxShadow: `0 0 10px ${colorByRecency(vessel.online)}50` }}>
                            <PiWifiHigh className="w-5 h-5 drop-shadow-md" style={{ color: '#fff' }} />
                          </div>
                          <span className="text-[10px] text-gray-400">Internet</span>
                        </div>

                        {/* GPS */}
                        <div className="flex flex-col items-center gap-1.5 w-[42px]">
                          <div className="relative w-10 h-10 rounded-full flex items-center justify-center border" style={{ backgroundColor: colorByRecency(vessel.position.timestamp), borderColor: colorByRecency(vessel.position.timestamp), boxShadow: `0 0 10px ${colorByRecency(vessel.position.timestamp)}50` }}>
                            <PiNavigationArrow className="w-5 h-5 drop-shadow-md" style={{ color: '#fff' }} />
                          </div>
                          <span className="text-[10px] text-gray-400">GPS</span>
                        </div>

                        <div className="w-[1px] h-12 bg-gray-700/50 mx-1"></div>

                        {/* Engines */}
                        {([
                          { key: 'me1', label: 'ME1', objKey: 'me1', icon: PiEngine },
                          { key: 'me2', label: 'ME2', objKey: 'me2', icon: PiEngine },
                          { key: 'me3', label: 'ME3', objKey: 'me3', icon: PiEngine },
                          { key: 'ae1', label: 'AE1', objKey: 'ae1', icon: PiLightningFill },
                          { key: 'ae2', label: 'AE2', objKey: 'ae2', icon: PiLightningFill },
                        ] as const).map(({ key, label, objKey, icon: Icon }) => {
                          const eqEngineId = key;
                          const eqAlarmEngine = engineValueToAlarmEngine[eqEngineId];

                          let engineAlarms = 0;
                          if (eqAlarmEngine && vesselAlarmData[vessel.vessel_id]) {
                            engineAlarms = vesselAlarmData[vessel.vessel_id].filter(a => a.status === 'active' && a.engine === eqAlarmEngine).length;
                          }
                          const isForcedGreen = key === 'me1' || key === 'me2' || key === 'ae1';
                          const engineTimeColor = isForcedGreen
                            ? '#4ade80'
                            : colorByRecency((vessel as any)[objKey]);
                          const hasCritical = vesselAlarmData[vessel.vessel_id]?.some(a => a.status === 'active' && a.engine === eqAlarmEngine && a.severity === 1);
                          let finalColor = engineTimeColor;
                          if (!isForcedGreen && hasCritical && finalColor === '#4ade80') finalColor = '#facc15';

                          if ((vessel as any)[objKey] === 0) return null;

                          return (
                            <div key={key} className="flex flex-col items-center gap-1.5 w-[42px] cursor-pointer group pointer-events-auto" onClick={() => handleEngineClick(vessel, eqEngineId)}>
                              <div className="relative w-10 h-10 rounded-full flex items-center justify-center border group-hover:opacity-90 transition-colors" style={{ backgroundColor: finalColor, borderColor: finalColor, boxShadow: `0 0 10px ${finalColor}50` }}>
                                <Icon className="w-5 h-5 drop-shadow-md" style={{ color: '#fff' }} />
                                {engineAlarms > 0 && (
                                  <div className="absolute -top-1.5 -right-1.5 bg-red-400 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-[#1e1e1e]">
                                    {engineAlarms > 9 ? '9+' : engineAlarms}
                                  </div>
                                )}
                              </div>
                              <span className="text-[10px] text-gray-400 group-hover:text-white transition-colors">{label}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Critical alarms banner */}
                      {criticalAlarms > 0 && (
                        <div className="flex items-center justify-center gap-2 w-full bg-red-950/30 text-red-500 border border-red-900/50 rounded-lg py-2.5 mb-3 text-[11px] font-medium">
                          <PiBellSimpleRingingFill className="w-3.5 h-3.5" />
                          {criticalAlarms} critical alarm{criticalAlarms !== 1 ? 's' : ''} in the last 5 hours
                        </div>
                      )}

                      {/* Action button */}
                      <button
                        onClick={() => handleConditionMonitoringClick(vessel)}
                        className="pointer-events-auto w-full bg-blue-900/40 hover:bg-blue-800/50 text-blue-400 font-semibold py-2.5 rounded-lg border border-blue-800/50 flex items-center justify-between px-4 transition-colors text-[13px]"
                      >
                        View Condition Monitoring
                        <PiArrowRight className="w-4 h-4" />
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
