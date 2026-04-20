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
import { toPng } from 'html-to-image';
import { useAtom } from 'jotai';
import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { PiCameraBold, PiFileCsvBold } from 'react-icons/pi';
import { Select } from 'rizzui/select';
import { Tooltip } from 'rizzui';
import { exportSensorDataCSV } from '@/services/api';

function getDateRange(
  preset: string,
  customRange: [Date | null, Date | null]
): { from: string; to: string } {
  const now = new Date();
  let from: Date;
  switch (preset) {
    case '1h':
      from = new Date(now.getTime() - 60 * 60 * 1000);
      break;
    case '1d':
      from = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '1m':
      from = new Date(now);
      from.setMonth(from.getMonth() - 1);
      break;
    case '3m':
      from = new Date(now);
      from.setMonth(from.getMonth() - 3);
      break;
    case 'Custom Time':
      if (customRange[0] && customRange[1]) {
        return {
          from: customRange[0].toISOString(),
          to: customRange[1].toISOString(),
        };
      }
      from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    default:
      from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }
  return { from: from.toISOString(), to: now.toISOString() };
}

const timeOptions = ['1h', '1d', '7d', '1m', '3m', 'Custom Time'];

export default function ConditionMonitoringHeaderSelectors() {
  const [selectedShip, setSelectedShip] = useAtom(selectedShipAtom);
  const [selectedEngine, setSelectedEngine] = useAtom(selectedEngineAtom);
  const [selectedTime, setSelectedTime] = useAtom(selectedTimeAtom);
  const [dateRange, setDateRange] = useAtom(dateRangeAtom);
  const datePickerRef = useRef<HTMLElement>(null);

  // Fetch real vessel & engine options from API
  const handleVesselLoaded = useCallback(
    (vessels: Ship[]) => {
      if (vessels.length > 0 && !selectedShip?.id) setSelectedShip(vessels[0]);
    },
    [selectedShip, setSelectedShip]
  );
  const vesselOptions = useVesselOptions(handleVesselLoaded);
  const allEngineOptions = useEngineOptionsList();
  // Condition Monitoring doesn't use the "All Engine" view
  const engineOptions = allEngineOptions.filter((e) => e.value !== 'all');

  // Default to ME Port (me1) for this page
  useEffect(() => {
    if (engineOptions.length > 0) {
      const valid = engineOptions.some(
        (e) => e.value === selectedEngine?.value
      );
      if (!valid) {
        const me1 = engineOptions.find((e) => e.value === 'me1');
        setSelectedEngine(me1 ?? engineOptions[0]);
      }
    }
  }, [engineOptions, selectedEngine, setSelectedEngine]);

  // Auto-open date picker when "Custom Time" is selected
  useEffect(() => {
    if (selectedTime === 'Custom Time') {
      const timer = setTimeout(() => {
        const datePickerInput = document.querySelector(
          '.react-datepicker__input-container input'
        ) as HTMLInputElement;
        if (datePickerInput) {
          datePickerInput.focus();
          datePickerInput.click();
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [selectedTime]);

  const [snapshotting, setSnapshotting] = useState(false);
  const [csvExporting, setCsvExporting] = useState(false);

  const handlePageSnapshot = useCallback(async () => {
    if (snapshotting) return;
    setSnapshotting(true);
    try {
      const mainEl = document.querySelector('main') as HTMLElement | null;
      const target = mainEl ?? document.body;
      const dataUrl = await toPng(target, {
        cacheBust: true,
        backgroundColor: '#111827',
        pixelRatio: 2,
      });
      const link = document.createElement('a');
      link.download = 'condition-monitoring-snapshot.png';
      link.href = dataUrl;
      link.click();
      toast.success('Page snapshot downloaded');
    } catch (err) {
      console.error('Page snapshot failed:', err);
      toast.error('Page snapshot failed');
    } finally {
      setSnapshotting(false);
    }
  }, [snapshotting]);

  const handleCsvExport = useCallback(async () => {
    if (csvExporting || !selectedShip?.id) return;
    setCsvExporting(true);
    try {
      const { from, to } = getDateRange(selectedTime, dateRange);
      await exportSensorDataCSV(
        selectedShip.id,
        from,
        to,
        selectedEngine?.value
      );
      toast.success('CSV export downloaded');
    } catch (err) {
      console.error('CSV export failed:', err);
      toast.error(
        'CSV export failed. The server may have timed out — try a shorter date range.'
      );
    } finally {
      setCsvExporting(false);
    }
  }, [csvExporting, selectedShip, selectedEngine, selectedTime, dateRange]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        options={vesselOptions}
        value={selectedShip}
        onChange={(v: Ship) => setSelectedShip(v)}
        className="w-52"
        selectClassName="h-9 text-sm"
        dropdownClassName="text-gray-900"
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

      {/* Page Snapshot & CSV Export */}
      <div className="flex items-center gap-1">
        <Tooltip content="Download page snapshot" placement="bottom">
          <button
            onClick={handlePageSnapshot}
            disabled={snapshotting}
            className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground disabled:opacity-50"
          >
            <PiCameraBold className="h-5 w-5" />
          </button>
        </Tooltip>
        <Tooltip content="Export sensor data CSV" placement="bottom">
          <button
            onClick={handleCsvExport}
            disabled={csvExporting}
            className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground disabled:opacity-50"
          >
            <PiFileCsvBold className="h-5 w-5" />
          </button>
        </Tooltip>
      </div>
    </div>
  );
}
