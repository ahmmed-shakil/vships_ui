'use client';

import GoogleMap from '@/components/google-map';
import { useEffect, useState } from 'react';
import { Loader, Text } from 'rizzui';

export default function FleetOverviewPage() {
  // map will update every 10 seconds
  const [showMapUpdating, setShowMapUpdating] = useState(false);
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
    <>
      {/* Loading Overlay */}
      {showMapUpdating && <MapLoadingSpinner />}

      {/* Full Map */}
      <GoogleMap />
    </>
  );
}

const MapLoadingSpinner = () => {
  return <div className="fixed top-20 left-1/2 translate-x-1/4 z-10 flex items-center gap-2 rounded-full px-4 py-2 backdrop-blur-sm bg-primary/50 text-secondary-lighter">
    <Loader variant="spinner" size="sm" />
    <Text className="font-medium text-gray-700 dark:text-gray-200">
      Map Updating
    </Text>
  </div>
}