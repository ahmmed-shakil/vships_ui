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
import { Select } from 'rizzui/select';

const timeOptions = ['1h', '1d', '7d', '1m', '3m', 'Custom Time'];

export default function ConditionMonitoringHeaderSelectors() {
    const [selectedShip, setSelectedShip] = useAtom(selectedShipAtom);
    const [selectedEngine, setSelectedEngine] = useAtom(selectedEngineAtom);
    const [selectedTime, setSelectedTime] = useAtom(selectedTimeAtom);
    const [dateRange, setDateRange] = useAtom(dateRangeAtom);

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
                options={engineData}
                value={selectedEngine}
                onChange={setSelectedEngine}
                className="w-36"
                selectClassName="h-9 text-sm"
                dropdownClassName="text-gray-900"
            />

            {/* Time Range Toggle Group */}
            <div className="flex rounded border border-muted overflow-hidden shrink-0">
                {timeOptions.map((opt) => (
                    <button
                        key={opt}
                        onClick={() => setSelectedTime(opt)}
                        className={cn(
                            'px-4 py-1.5 border-r border-muted border-2 last:border-r-0 transition-all duration-200',
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
                <div className="w-52 shrink-0 rounded border border-muted">
                    <DateRangePicker
                        startDate={dateRange[0]}
                        endDate={dateRange[1]}
                        onChange={setDateRange}
                        className="h-8 border-none bg-background text-sm w-full focus:ring-0"
                        placeholder="Select custom dates"
                    />
                </div>
            )}
        </div>
    );
}
