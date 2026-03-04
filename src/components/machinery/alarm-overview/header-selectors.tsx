'use client';

import { shipData, type Ship } from '@/data/nura/ships';
import { selectedShipAtom } from '@/store/condition-monitoring-atoms';
import { useAtom } from 'jotai';
import { Select } from 'rizzui/select';

export default function AlarmOverviewHeaderSelectors() {
  const [selectedShip, setSelectedShip] = useAtom(selectedShipAtom);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        options={shipData}
        value={selectedShip}
        onChange={(v: Ship) => setSelectedShip(v)}
        className="w-44"
        selectClassName="h-9 text-sm"
        dropdownClassName="text-gray-900"
        placeholder="Select Vessel"
      />
    </div>
  );
}
