'use client';

import { useVesselOptions, useEngineOptionsList } from '@/hooks/use-api-data';
import type { Ship } from '@/data/nura/ships';
import {
  selectedEngineAtom,
  selectedShipAtom,
} from '@/store/condition-monitoring-atoms';
import { useAtom } from 'jotai';
import { useCallback } from 'react';
import { Select } from 'rizzui/select';

export default function AlarmOverviewHeaderSelectors() {
  const [selectedShip, setSelectedShip] = useAtom(selectedShipAtom);
  const [selectedEngine, setSelectedEngine] = useAtom(selectedEngineAtom);
  const handleLoaded = useCallback(
    (vessels: Ship[]) => {
      if (vessels.length > 0 && !selectedShip?.id) setSelectedShip(vessels[0]);
    },
    [selectedShip, setSelectedShip]
  );
  const vesselOptions = useVesselOptions(handleLoaded);
  const engineOptions = useEngineOptionsList();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        options={vesselOptions}
        value={selectedShip}
        onChange={(v: Ship) => setSelectedShip(v)}
        className="w-44"
        selectClassName="h-9 text-sm"
        dropdownClassName="text-gray-900"
        placeholder="Select Vessel"
      />
      <Select
        options={engineOptions}
        value={selectedEngine}
        onChange={setSelectedEngine}
        className="w-36"
        selectClassName="h-9 text-sm"
        dropdownClassName="text-gray-900"
      />
    </div>
  );
}
