'use client';

import { shipData, type Ship } from '@/data/nura/ships';
import { selectedMachineryShipAtom } from '@/store/machinery-alarm-atoms';
import { useAtom } from 'jotai';
import { Select } from 'rizzui/select';

const timeOptions = [
  { label: 'Last 24h', value: '24h' },
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
];

/* ------------------------------------------------------------------ */
/* Component */
/* ------------------------------------------------------------------ */

export default function MachineryOverviewHeaderSelectors() {
  const [selectedShip, setSelectedShip] = useAtom(selectedMachineryShipAtom);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        options={shipData}
        value={selectedShip}
        onChange={(v: Ship) => setSelectedShip(v)}
        className="w-36"
        selectClassName="h-9 text-sm"
        dropdownClassName="text-gray-900"
      />

      <Select
        options={timeOptions}
        value={timeOptions[1]}
        onChange={() => {}}
        className="w-40"
        selectClassName="h-9 text-sm"
        dropdownClassName="text-gray-900"
      />
    </div>
  );
}
