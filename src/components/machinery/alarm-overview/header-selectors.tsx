'use client';

import DateRangePicker from '@/components/date/date-range';
import type { Ship } from '@/data/nura/ships';
import { useEngineOptionsList, useVesselOptions } from '@/hooks/use-api-data';
import {
  dateRangeAtom,
  selectedEngineAtom,
  selectedShipAtom,
  selectedTimeAtom,
} from '@/store/condition-monitoring-atoms';
import cn from '@/utils/class-names';
import { useAtom } from 'jotai';
import { useCallback, useEffect } from 'react';
import { Select } from 'rizzui/select';

const timeOptions = ['1h', '1d', '7d', '1m', '3m', 'Custom Time'];

export default function AlarmOverviewHeaderSelectors() {
  const [selectedShip, setSelectedShip] = useAtom(selectedShipAtom);
  const [selectedEngine, setSelectedEngine] = useAtom(selectedEngineAtom);
  const [selectedTime, setSelectedTime] = useAtom(selectedTimeAtom);
  const [dateRange, setDateRange] = useAtom(dateRangeAtom);

  const handleLoaded = useCallback(
    (vessels: Ship[]) => {
      if (vessels.length > 0 && !selectedShip?.id) setSelectedShip(vessels[0]);
    },
    [selectedShip, setSelectedShip]
  );
  const vesselOptions = useVesselOptions(handleLoaded);
  const allEngineOptions = useEngineOptionsList();
  const engineOptions = allEngineOptions.filter((e) => e.value !== 'all');

  // Sync engine label from API (e.g. 'ME Stbd' → 'ME Starboard')
  useEffect(() => {
    if (engineOptions.length > 0) {
      const match = engineOptions.find((e) => e.value === selectedEngine?.value);
      if (match) {
        if (match.label !== selectedEngine?.label) setSelectedEngine(match);
      } else {
        const me2 = engineOptions.find((e) => e.value === 'me2');
        setSelectedEngine(me2 ?? engineOptions[0]);
      }
    }
  }, [engineOptions, selectedEngine, setSelectedEngine]);

  // Auto-open date picker when Custom Time is selected
  useEffect(() => {
    if (selectedTime === 'Custom Time') {
      const timer = setTimeout(() => {
        const input = document.querySelector(
          '.react-datepicker__input-container input'
        ) as HTMLInputElement;
        if (input) { input.focus(); input.click(); }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [selectedTime]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        options={vesselOptions}
        value={selectedShip}
        onChange={(v: Ship) => setSelectedShip(v)}
        className="w-52"
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

      {/* Time Range Toggle Group */}
      <div className="flex space-x-6 rounded-lg border-2 bg-background">
        <div className="flex shrink-0 overflow-hidden rounded border border-muted">
          {timeOptions.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setSelectedTime(opt)}
              className={cn(
                'border-r-2 border-muted px-4 py-1.5 transition-all duration-200',
                selectedTime === opt
                  ? 'bg-primary/10 font-semibold text-primary'
                  : 'font-medium text-foreground hover:bg-muted/50'
              )}
            >
              {opt}
            </button>
          ))}
        </div>

        {selectedTime === 'Custom Time' && (
          <div className="block">
            <div className="w-52 shrink-0">
              <DateRangePicker
                startDate={dateRange[0]}
                endDate={dateRange[1]}
                onChange={setDateRange}
                className="h-8 w-full border-none bg-background text-sm focus:ring-0"
                placeholder="Select custom dates"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
