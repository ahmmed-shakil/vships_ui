'use client';

import { fleetVesselData } from '@/data/nura/fleet-data';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { PiCloudSunDuotone, PiMapTrifoldDuotone } from 'react-icons/pi';
import { ActionIcon, Loader, Text, Tooltip } from 'rizzui';

// Leaflet requires `window` — load it client-only
const VesselMap = dynamic(
    () => import('@/components/vessel-map/vessel-map'),
    { ssr: false }
);

const WindyMap = dynamic(
    () => import('@/components/vessel-map/windy-map'),
    { ssr: false }
);

export default function FleetOverviewLayout() {
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
        <div className="relative w-full h-full">
            {/* Loading Overlay */}
            {showMapUpdating && <MapLoadingSpinner />}

            {/* Map Toggle Button */}
            <div className="absolute top-36 right-4 z-[1002]">
                <Tooltip
                    content={useWindy ? 'Switch to Standard Map' : 'Switch to Weather Map'}
                    placement="left"
                >
                    <ActionIcon
                        variant="solid"
                        size="lg"
                        className="rounded-full shadow-lg bg-background text-foreground dark:hover:bg-background/50"
                        onClick={() => setUseWindy(!useWindy)}
                    >
                        {useWindy ? <PiMapTrifoldDuotone className="w-5 h-5" /> : <PiCloudSunDuotone className="w-5 h-5" />}
                    </ActionIcon>
                </Tooltip>
            </div>

            {/* Display active map */}
            {useWindy ? (
                <WindyMap
                    vessels={fleetVesselData}
                    minHeight="calc(100vh - 135px)"
                    // apiKey="DxgZtU5W7x1Yw95RHPIWR4N0iJ0PVYaU"
                    apiKey='Bq4H59NFar1J2dQjOjaDZt5yAgrTmBU3'
                />
            ) : (
                <VesselMap
                    vessels={fleetVesselData}
                    minHeight="calc(100vh - 135px)"
                />
            )}
        </div>
    );
}

const MapLoadingSpinner = () => {
    return (
        <div className="fixed top-28 left-80 z-[999] flex items-center gap-2 rounded-full px-4 py-2 backdrop-blur-sm bg-primary/50 text-secondary-lighter">
            <Loader variant="spinner" size="sm" />
            <Text className="font-medium text-gray-700 dark:text-gray-200">
                Map Updating
            </Text>
        </div>
    );
};