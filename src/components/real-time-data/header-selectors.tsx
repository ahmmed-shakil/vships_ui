'use client';

import DateRangePicker from '@/components/date/date-range';
import { useVesselOptions, useEngineOptionsList } from '@/hooks/use-api-data';
import type { Ship } from '@/data/nura/ships';
import {
  dateRangeAtom,
  selectedEngineAtom,
  selectedShipAtom,
  selectedTimeAtom,
} from '@/store/condition-monitoring-atoms';
import cn from '@/utils/class-names';
import { useAtom } from 'jotai';
import { useCallback, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { Select } from 'rizzui/select';

const timeOptions = [
  '5 min',
  '30 min',
  '2 hours',
  '12h',
  '24h',
  '48h',
  'Custom Time',
];

export default function AlarmMonitoringHeaderSelectors() {
  const pathname = usePathname();
  const isTrendAnalysis = pathname.startsWith('/real-time-data/trend-analysis');
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
  const engineOptions = useMemo(
    () =>
      isTrendAnalysis
        ? allEngineOptions.filter((e) => e.value !== 'all')
        : allEngineOptions,
    [allEngineOptions, isTrendAnalysis]
  );

  // Keep selected engine aligned with available options.
  // On /real-time-data: "All Engines" is allowed and stays selected.
  // On /real-time-data/trend-analysis: "All Engines" is filtered out;
  //   if current selection is invalid, default to first available engine.
  useEffect(() => {
    if (engineOptions.length === 0) return;
    const match = engineOptions.find((e) => e.value === selectedEngine?.value);
    if (match) {
      if (match.label !== selectedEngine?.label) setSelectedEngine(match);
      return;
    }
    if (!isTrendAnalysis) {
      const allOption = engineOptions.find((e) => e.value === 'all');
      setSelectedEngine(allOption ?? engineOptions[0]);
      return;
    }
    setSelectedEngine(engineOptions[0]);
  }, [engineOptions, isTrendAnalysis, selectedEngine, setSelectedEngine]);

  // Auto-open date picker when "Custom Time" is selected (trend-analysis only)
  useEffect(() => {
    if (!isTrendAnalysis) return;
    if (selectedTime === 'Custom Time') {
      const timer = setTimeout(() => {
        const datePickerInput = document.querySelector(
          '.react-datepicker__input-container input'
        ) as HTMLInputElement | null;
        if (datePickerInput) {
          datePickerInput.focus();
          datePickerInput.click();
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isTrendAnalysis, selectedTime]);

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

      {isTrendAnalysis && (
        <div className="flex space-x-6 rounded-lg border-2 bg-background">
          <div className="flex shrink-0 overflow-hidden rounded border border-muted">
            {timeOptions.map((opt) => (
              <button
                key={opt}
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
      )}
    </div>
  );
}
