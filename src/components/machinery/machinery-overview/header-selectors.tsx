'use client';

import { shipData, type Ship } from '@/data/nura/ships';
import { selectedShipAtom } from '@/store/condition-monitoring-atoms';
import { useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { Select } from 'rizzui/select';

/* ------------------------------------------------------------------ */
/*  Shared atoms so the page can read the selected values              */
/* ------------------------------------------------------------------ */

const timeOptions = [
  { label: 'Last 24h', value: '24h' },
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
];

export const overviewShipAtom = atomWithStorage<Ship>(
  'overviewShip',
  shipData[0]
);
export const overviewTimeAtom = atomWithStorage(
  'overviewTime',
  timeOptions[1] // default: "Last 7 days"
);

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function MachineryOverviewHeaderSelectors() {
  const [selectedShip, setSelectedShip] = useAtom(selectedShipAtom);
  const [selectedTime, setSelectedTime] = useAtom(overviewTimeAtom);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        options={shipData}
        value={selectedShip}
        onChange={(v: Ship) => setSelectedShip(v)}
        className="w-44"
        selectClassName="h-9 text-sm"
        dropdownClassName="text-gray-900"
      />

      <Select
        options={timeOptions}
        value={selectedTime}
        onChange={setSelectedTime}
        className="w-40"
        selectClassName="h-9 text-sm"
        dropdownClassName="text-gray-900"
      />
    </div>
  );
}
