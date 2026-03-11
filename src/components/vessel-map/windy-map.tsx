'use client';

import type { FleetVessel } from '@/data/nura/fleet-data';
import { formatDistanceToNowStrict } from 'date-fns';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { PiNavigationArrow, PiWifiHigh } from 'react-icons/pi';
import { PiEngine, PiEngineFill } from 'react-icons/pi';

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
  { value: 'gust', label: 'Wind Gusts', icon: '🌬️' },
  { value: 'rain', label: 'Rain', icon: '🌧️' },
  { value: 'temp', label: 'Temperature', icon: '🌡️' },
  { value: 'pressure', label: 'Pressure', icon: '🔵' },
  { value: 'clouds', label: 'Clouds', icon: '☁️' },
  { value: 'waves', label: 'Waves', icon: '🌊' },
  { value: 'swell', label: 'Swell', icon: '🌊' },
  { value: 'currents', label: 'Currents', icon: '🔄' },
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
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 min-w-[240px]">
                      <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                          {vessel.name}
                        </span>
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-medium text-white shadow-sm"
                          style={{ backgroundColor: color }}
                        >
                          {vessel.position_status}
                        </span>
                      </div>
                      
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-3 space-y-1">
                        <div className="flex justify-between">
                          <span>Timestamp:</span>
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {new Date(vessel.position.timestamp * 1000).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Last seen:</span>
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            2 mins ago
                          </span>
                        </div>
                      </div>

                      {/* Hardware Indicators */}
                      <div className="flex gap-1.5 justify-center pt-2">
                        {/* Wifi */}
                        <div className="p-1 rounded bg-[#4ade80] flex items-center justify-center">
                          <PiWifiHigh size={16} className="text-white" />
                        </div>
                        {/* Map */}
                        <div className="p-1 rounded bg-[#4ade80] flex items-center justify-center">
                          <PiNavigationArrow size={16} className="text-white" />
                        </div>
                        {/* Engines - Hardcoded to green for demo requirements */}
                        <div className="p-1 rounded bg-[#4ade80] flex items-center justify-center">
                          <PiEngine size={16} className="text-white" />
                        </div>
                        <div className="p-1 rounded bg-[#4ade80] flex items-center justify-center">
                          <PiEngine size={16} className="text-white" />
                        </div>
                        <div className="p-1 rounded bg-[#4ade80] flex items-center justify-center">
                          <PiEngineFill size={16} className="text-white" />
                        </div>
                      </div>
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
