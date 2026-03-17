'use client';

import DateRangePicker from '@/components/date/date-range';
import { engineData, shipData, type Ship } from '@/data/nura/ships';
import {
    dateRangeAtom,
    selectedEngineAtom,
    selectedShipAtom,
    selectedTimeAtom,
} from '@/store/condition-monitoring-atoms';
import cn from '@/utils/class-names';
import { useAtom } from 'jotai';
import { useEffect, useMemo } from 'react';
import { Select } from 'rizzui/select';

const timeOptions = ['1h', '1d', '7d', '1m', '3m', 'Custom Time'];

export default function ConditionMonitoringHeaderSelectors() {
    const [selectedShip, setSelectedShip] = useAtom(selectedShipAtom);
    const [selectedEngine, setSelectedEngine] = useAtom(selectedEngineAtom);
    const [selectedTime, setSelectedTime] = useAtom(selectedTimeAtom);
    const [dateRange, setDateRange] = useAtom(dateRangeAtom);

    // Remove "All Engine" option for condition monitoring
    const filteredEngineData = useMemo(
        () => engineData.filter((e) => e.value !== 'all'),
        []
    );

    // If "All Engine" was globally selected, auto-select the first specific engine
    useEffect(() => {
        if (selectedEngine?.value === 'all' && filteredEngineData.length > 0) {
            setSelectedEngine(filteredEngineData[0]);
        }
    }, [selectedEngine, filteredEngineData, setSelectedEngine]);

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
                options={filteredEngineData}
                value={selectedEngine}
                onChange={setSelectedEngine}
                className="w-36"
                selectClassName="h-9 text-sm"
                dropdownClassName="text-gray-900"
            />

            {/* Time Range Toggle Group */}
            <div className='flex bg-background space-x-6 border-2 rounded-lg'>
                <div className="flex rounded border border-muted overflow-hidden shrink-0">
                    {timeOptions.map((opt) => (
                        <button
                            key={opt}
                            onClick={() => setSelectedTime(opt)}
                            className={cn(
                                'px-4 py-1.5 border-r-2 border-muted transition-all duration-200',
                                selectedTime === opt
                                    ? 'bg-primary/10 text-primary font-semibold'
                                    : 'text-foreground hover:bg-muted/50 font-medium'
                            )}
                        >
                            {opt}
                        </button>
                    ))}
                </div>

                {selectedTime === 'Custom Time' && (
                    <div className='block'>
                        <div className="w-52 shrink-0">
                            <DateRangePicker
                                startDate={dateRange[0]}
                                endDate={dateRange[1]}
                                onChange={setDateRange}
                                className="h-8 border-none bg-background text-sm w-full focus:ring-0"
                                placeholder="Select custom dates"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
