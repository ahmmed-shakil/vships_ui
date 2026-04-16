'use client';

import { useVesselOptions, useEngineOptionsList } from '@/hooks/use-api-data';
import type { Ship } from '@/data/nura/ships';
import {
  selectedEngineAtom,
  selectedShipAtom,
} from '@/store/condition-monitoring-atoms';
import { useAtom } from 'jotai';
import { useCallback, useEffect, useMemo } from 'react';
import { Select } from 'rizzui/select';

export default function AlarmMonitoringHeaderSelectors() {
  const [selectedShip, setSelectedShip] = useAtom(selectedShipAtom);
  const [selectedEngine, setSelectedEngine] = useAtom(selectedEngineAtom);
  const handleLoaded = useCallback(
    (vessels: Ship[]) => {
      if (vessels.length > 0 && !selectedShip?.id) setSelectedShip(vessels[0]);
    },
    [selectedShip, setSelectedShip]
  );
  const vesselOptions = useVesselOptions(handleLoaded);
  const allEngineOptions = useEngineOptionsList();
  const engineOptions = useMemo(
    () => allEngineOptions.filter((e) => e.value !== 'all'),
    [allEngineOptions]
  );

  // Keep selected engine aligned with API options by value.
  // This ensures fleet-map picks like DG2 show correctly in header,
  // and labels stay current (e.g. STBD -> Starboard).
  // No "All Engine" here — default to DG1 (or first real engine) for single-engine API queries.
  useEffect(() => {
    if (engineOptions.length === 0) return;
    const match = engineOptions.find((e) => e.value === selectedEngine?.value);
    if (match) {
      if (match.label !== selectedEngine?.label) setSelectedEngine(match);
      return;
    }
    const dg1 = engineOptions.find((e) => e.value.toLowerCase() === 'dg1');
    setSelectedEngine(dg1 ?? engineOptions[0]);
  }, [engineOptions, selectedEngine, setSelectedEngine]);

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
        options={allEngineOptions}
        value={selectedEngine}
        onChange={setSelectedEngine}
        className="w-36"
        selectClassName="h-9 text-sm"
        dropdownClassName="text-gray-900"
      />
    </div>
  );
}
