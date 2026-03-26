'use client';

import {
  useFleetData,
  useAllVesselAlarms,
  useEmissionZoneData,
} from '@/hooks/use-api-data';
import dynamic from 'next/dynamic';
import { useMemo, useEffect, useState } from 'react';
import { PiCloudSunDuotone, PiMapTrifoldDuotone } from 'react-icons/pi';
import { ActionIcon, Loader, Text, Tooltip } from 'rizzui';

// Leaflet requires `window` — load it client-only
const VesselMap = dynamic(() => import('@/components/vessel-map/vessel-map'), {
  ssr: false,
});

const WindyMap = dynamic(() => import('@/components/vessel-map/windy-map'), {
  ssr: false,
});

export default function FleetOverviewLayout() {
  // Fetch fleet vessel data from API with 10s polling
  const { data: fleetVessels } = useFleetData(10000);

  // Fetch alarm data for all vessels shown on the map
  const vesselIds = useMemo(
    () => fleetVessels.map((v) => v.vessel_id),
    [fleetVessels]
  );
  const alarmData = useAllVesselAlarms(vesselIds);

  // Fetch emission zones
  const emissionZoneData = useEmissionZoneData();

  // map will update every 10 seconds
  const [showMapUpdating, setShowMapUpdating] = useState(false);
  const [useWindy, setUseWindy] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowMapUpdating(true);
      setTimeout(() => {
        setShowMapUpdating(false);
      }, 5000);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-full w-full">
      {/* Loading Overlay */}
      {showMapUpdating && <MapLoadingSpinner />}

      {/* Map Toggle Button */}
      <div className="absolute right-4 top-36 z-[1002]">
        <Tooltip
          content={
            useWindy ? 'Switch to Standard Map' : 'Switch to Weather Map'
          }
          placement="left"
        >
          <ActionIcon
            variant="solid"
            size="lg"
            className="rounded-full bg-background text-foreground shadow-lg dark:hover:bg-background/50"
            onClick={() => setUseWindy(!useWindy)}
          >
            {useWindy ? (
              <PiMapTrifoldDuotone className="h-5 w-5" />
            ) : (
              <PiCloudSunDuotone className="h-5 w-5" />
            )}
          </ActionIcon>
        </Tooltip>
      </div>

      {/* Display active map */}
      {useWindy ? (
        <WindyMap
          vessels={fleetVessels}
          minHeight="calc(100vh - 135px)"
          apiKey="Bq4H59NFar1J2dQjOjaDZt5yAgrTmBU3"
          alarmData={alarmData}
        />
      ) : (
        <VesselMap
          vessels={fleetVessels}
          minHeight="calc(100vh - 135px)"
          alarmData={alarmData}
          emissionZoneData={emissionZoneData}
        />
      )}
    </div>
  );
}

const MapLoadingSpinner = () => {
  return (
    <div className="fixed left-80 top-28 z-[999] flex items-center gap-2 rounded-full bg-primary/50 px-4 py-2 text-secondary-lighter backdrop-blur-sm">
      <Loader variant="spinner" size="sm" />
      <Text className="font-medium text-gray-700 dark:text-gray-200">
        Map Updating
      </Text>
    </div>
  );
};
