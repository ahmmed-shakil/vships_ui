"use client"

import WidgetCard from "@/components/cards/widget-card";
import DateRangePicker from "@/components/date/date-range";
import SpeedMeter from "@/components/speed-meter/speed-meter";
import { engineData, shipData } from "@/data/nura/ships";
import cn from "@/utils/class-names";
import Image from "next/image";
import { useState } from "react";
import { Select } from "rizzui/select";

// ─── Reusable Dotted Row Component ───────────────────────────────────────────
function DottedRow({ label, value, className }: { label: string; value: React.ReactNode; className?: string }) {
    return (
        <div className={cn("flex items-baseline w-full py-1.5 text-sm", className)}>
            <span className="text-foreground font-medium whitespace-nowrap">{label}</span>
            {/* The flex-1 dashed border acts as the responsive separator */}
            <div className="flex-1 mx-3 border-b border-dashed border-muted relative -top-1 hidden sm:block"></div>
            <span className="text-foreground font-semibold whitespace-nowrap text-right">{value}</span>
        </div>
    );
}

export default function ConditionMonitoringLayout() {
    const [selectedShip, setSelectedShip] = useState(shipData[0]);
    const [selectedEngine, setSelectedEngine] = useState(engineData[0]);

    // Time selection state
    const timeOptions = ['1h', '1d', '7d', '1m', '3m', 'Custom Time'];
    const [selectedTime, setSelectedTime] = useState('7d');
    const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);

    return (
        <>
            {/* selection ui */}
            <div className="flex flex-wrap items-center gap-4 p-3 rounded shadow-sm">

                <Select
                    options={shipData}
                    value={selectedShip}
                    onChange={setSelectedShip}
                    className="w-36"
                    selectClassName="bg-transparent border-white/50 text-white hover:border-white focus:border-white focus:ring-0 [&>span]:text-white h-9"
                    dropdownClassName="text-gray-900"
                />

                <Select
                    options={engineData}
                    value={selectedEngine}
                    onChange={setSelectedEngine}
                    className="w-36"
                    selectClassName="bg-transparent border-white/50 text-white hover:border-white focus:border-white focus:ring-0 [&>span]:text-white h-9"
                    dropdownClassName="text-gray-900"
                />

                {/* Time Range Toggle Group */}
                <div className="flex rounded border border-white/50 overflow-hidden shrink-0">
                    {timeOptions.map((opt) => (
                        <button
                            key={opt}
                            onClick={() => setSelectedTime(opt)}
                            className={cn(
                                "px-4 py-1.5 text-sm border-r border-white/50 last:border-r-0 hover:scale-110 transition-all duration-300",
                                selectedTime === opt
                                    ? "bg-muted text-primary-lighter font-semibold"
                                    : "text-foreground hover:bg-muted font-medium"
                            )}
                        >
                            {opt}
                        </button>
                    ))}
                </div>

                {selectedTime === 'Custom Time' && (
                    <div className="w-56 shrink-0 rounded p-0.5 border-2 border-muted">
                        <DateRangePicker
                            startDate={dateRange[0]}
                            endDate={dateRange[1]}
                            onChange={setDateRange}
                            className="h-8 border-none bg-background text-primary-lighter text-sm w-full focus:ring-0"
                            placeholder="Select custom dates"
                        />
                    </div>
                )}

                {/* Parameters Dropdown Placeholder */}
                {/* <div className="flex-1 flex items-center justify-center border-2 border-dashed border-white rounded py-1.5 px-6 text-white text-xs whitespace-nowrap min-w-[200px]">
                    drop down for the parameters
                </div> */}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ─── Card 1: ME 2 Port ──────────────────────────────────────────────── */}
                <WidgetCard title="ME 2 Port" className="flex flex-col">
                    <div className="flex items-center flex-1">
                        <div className="w-2/5 shrink-0 flex items-center justify-center">
                            <Image
                                src="/engine/engine-1.png"
                                alt="Engine Make"
                                className="w-full object-contain drop-shadow-sm"
                                width={200}
                                height={200}
                            />
                        </div>
                        <div className="w-full flex flex-col justify-center">
                            <DottedRow label="Make" value="MaK 9M25C" />
                            <DottedRow label="Built" value="2016" />
                            <DottedRow label="Rating" value="2500 kW" />
                        </div>
                    </div>
                </WidgetCard>

                {/* ─── Card 2: Basic Information ──────────────────────────────────────── */}
                <WidgetCard
                    title="Basic Information"
                    className="flex flex-col"
                    action={
                        <div className="flex flex-col items-end">
                            <div className="flex items-center gap-3 -mt-6">
                                <div className="text-[11px] font-semibold text-foreground uppercase tracking-widest leading-tight text-right">
                                    Health<br />Score
                                </div>
                                <SpeedMeter bare size="sm" className="w-36" max={100} min={0} fillColor="orange" value={80} />
                            </div>
                            <div className="text-[9px] text-muted -mt-9 flex gap-2 mr-1">
                                <span>Low: param 1</span>
                                <span>param 2</span>
                                <span>param 3</span>
                            </div>
                        </div>
                    }
                >
                    <div className="flex flex-col flex-1 justify-center gap-2">
                        <DottedRow label="Last overhaul" value="12 Nov 2025" />
                        <DottedRow label="Total running hours" value="5403 hrs" />
                        <DottedRow label="Period running hours" value="251 hrs" />
                        <DottedRow label="Duration fuel consumption" value="-- kg" />
                        <DottedRow label="Duration average load" value="-- %" />
                    </div>
                </WidgetCard>

                {/* ─── Card 3: SFOC Scatter ───────────────────────────────────────────── */}
                <WidgetCard
                    title="SFOC Scatter"
                    description={
                        <span className="text-xs font-normal text-muted-foreground ml-2">
                            ( SFOC - Specific fuel oil consumption )
                        </span>
                    }
                    className="flex flex-col"
                    titleClassName="inline-flex items-center"
                >
                    <div className="flex flex-col items-center justify-center h-full min-h-[220px] mt-4 relative">
                        {/* Placeholder cross pattern matching screenshot */}
                        <div className="absolute inset-0 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900 overflow-hidden text-clip flex items-center justify-center">
                            <svg className="absolute inset-0 w-full h-full stroke-gray-300 dark:stroke-gray-700 stroke-1" preserveAspectRatio="none">
                                <line x1="0" y1="0" x2="100%" y2="100%" />
                                <line x1="100%" y1="0" x2="0" y2="100%" />
                            </svg>
                        </div>
                    </div>
                </WidgetCard>
            </div>
        </>
    );
}