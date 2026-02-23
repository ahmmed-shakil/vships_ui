"use client"

import { vesselAlarmData } from "@/data/nura/alarm-data";
import {
    computeGKWH,
    findEngine,
    FUEL_GAUGE_MAX,
    RPM_GAUGE_MAX,
    vesselGensetData,
    type EngineMonitorData,
} from "@/data/nura/engine-data";
import { engineData, shipData, type Ship } from "@/data/nura/ships";
import cn from "@/utils/class-names";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { Select } from "rizzui/select";
import { Text } from "rizzui/typography";

import SpeedMeter from "../speed-meter/speed-meter";
import AlarmTable from "./alarm-table";

const OperationMonitorMap = dynamic(
    () => import('@/components/operation-monitor/operation-monitor-map'),
    { ssr: false }
);

// ─── Stat badge (Total Fuel / Run Hrs) ───────────────────────────────────────

function StatRow({ label, value, unit }: { label: string; value: string; unit: React.ReactNode }) {
    return (
        <div className="flex flex-col items-center">
            <span className="text-xs font-semibold text-muted-foreground">{label}</span>
            <div className="flex items-center gap-1">
                <span className="inline-block rounded bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary font-mono">
                    {value}
                </span>
                <span className="text-[10px] text-muted-foreground">{unit}</span>
            </div>
        </div>
    );
}

// ─── Engine group: 2 meters + stats (or "No data") ──────────────────────────

function EngineGroup({
    engine,
    size = 'default',
    layout = 'horizontal',
    className,
    className2,
    className3,
}: {
    engine: EngineMonitorData | undefined;
    size?: 'sm' | 'default';
    layout?: 'horizontal' | 'vertical';
    className?: string;
    className2?: string;
    className3?: string;
}) {
    if (!engine) {
        return (
            <div className={className}>
                <div className="flex items-center justify-center h-full min-h-[120px]">
                    <Text className="text-sm text-muted-foreground italic">No data</Text>
                </div>
            </div>
        );
    }

    const gkwh = computeGKWH(engine.gauge.fuel_cons, engine.gauge.engine_load);

    return (
        <div className={cn("flex flex-col", className)}>
            <div className={layout === "horizontal" ? "grid grid-cols-2" : "flex flex-col gap-2"}>
                {/* RPM meter */}
                <SpeedMeter
                    bare
                    size={size}
                    value={engine.gauge.engine_rpm}
                    max={RPM_GAUGE_MAX}
                    centerLabel={`${engine.gauge.engine_rpm.toFixed(0)}`}
                    className="border-0"
                />
                {/* Fuel meter */}
                <SpeedMeter
                    bare
                    size={size}
                    value={gkwh}
                    max={FUEL_GAUGE_MAX}
                    centerLabel={`${gkwh}`}
                    fillColor="#00858D"
                    className={cn("border-0", className2)}
                />
            </div>
            {/* Stats */}
            <div className={cn("flex justify-center gap-4", layout === "horizontal" ? "-mt-6" : "mt-2", className3)}>
                <StatRow
                    label="Total Fuel"
                    value={engine.totals.total_fuel.toFixed(2)}
                    unit={<>M<sup>3</sup></>}
                />
                <StatRow
                    label="Run Hrs"
                    value={engine.totals.running_hours.toFixed(2)}
                    unit="H"
                />
            </div>
        </div>
    );
}

// ─── Small engine pair (Genset): side-by-side in a 2-col grid ────────────────

function GensetGroup({
    engine,
    label,
    className,
}: {
    engine: EngineMonitorData | undefined;
    label: string;
    className?: string;
}) {
    return (
        <div className={className}>
            <h6 className="col-span-full text-center mt-auto text-sm font-semibold">{label}</h6>
            <EngineGroup engine={engine} size="sm" layout="horizontal" />
        </div>
    );
}

// ─── Layout ──────────────────────────────────────────────────────────────────

export const AlarmMonitorLayout = () => {
    const [selectedShip, setSelectedShip] = useState<Ship>(shipData[0]);
    const [selectedEngine, setSelectedEngine] = useState<string>(engineData[0].value);

    // Get alarm data for the selected vessel
    const alarms = useMemo(
        () => vesselAlarmData[selectedShip.id] ?? [],
        [selectedShip.id]
    );

    // Lookup engine data for the selected vessel
    const vesselId = selectedShip.id;
    const mePort = findEngine(vesselId, 'me1');
    const meStbd = findEngine(vesselId, 'me2');
    const meCenter = findEngine(vesselId, 'me3');
    const gensets = vesselGensetData[vesselId] ?? [];
    const genset1 = gensets.find((e) => e.id === 'ae1');
    const genset2 = gensets.find((e) => e.id === 'ae2');

    return (
        <>
            {/* ship selects */}
            <div className="flex gap-4">
                <Select
                    className={'max-w-72'}
                    options={shipData}
                    value={selectedShip}
                    onChange={(value: Ship) => setSelectedShip(value)}
                />
                <Select
                    className={'max-w-72'}
                    options={engineData}
                    value={selectedEngine}
                    onChange={setSelectedEngine}
                />
            </div>

            {/* main grid */}
            <div className='grid grid-cols-4 mt-4 shadow-lg'>
                <div className='col-span-3 mt-2'>
                    {/* meter section */}
                    <div className="grid grid-cols-12">
                        {/* Labels */}
                        <div className="col-span-full flex justify-around uppercase">
                            <h6 className="font-semibold">ME Port</h6>
                            <h6 className="font-semibold">ME STBD</h6>
                        </div>

                        {/* Row 1: ME PORT (RPM + Fuel) | ME STBD (RPM + Fuel) */}
                        <EngineGroup engine={mePort} className="col-span-6" />
                        <EngineGroup engine={meStbd} className="col-span-6" />

                        {/* Row 2: Genset 1 | ME CENTER | Genset 2 */}
                        <GensetGroup
                            engine={genset1}
                            label="Genset 1"
                            className="col-span-4 my-auto -z-10"
                        />
                        <div className="col-span-4 relative p-0 m-0 -mt-10">
                            {/* Half-height border lines */}
                            <div className="absolute left-0 top-1/4 bottom-1/4 w-0.5 bg-gray-300 dark:bg-gray-600" />
                            <div className="absolute right-0 top-1/4 bottom-1/4 w-0.5 bg-gray-300 dark:bg-gray-600" />
                            <h6 className="uppercase text-center text-sm font-semibold">ME Center</h6>
                            <EngineGroup engine={meCenter} layout="vertical" className2="-mt-20" className3="-mt-10" />
                        </div>
                        <GensetGroup
                            engine={genset2}
                            label="Genset 2"
                            className="col-span-4 my-auto -z-10"
                        />
                    </div>
                </div>

                {/* Map */}
                <OperationMonitorMap
                    name={selectedShip.label}
                    lat={selectedShip.position.lat}
                    long={selectedShip.position.long}
                    direction={selectedShip.position.direction}
                    timestamp={selectedShip.position.timestamp}
                    minHeight={500}
                />
            </div>

            {/* Alarm table */}
            <div className="mt-4">
                <AlarmTable
                    data={alarms}
                    title={`Alarms — ${selectedShip.label}`}
                />
            </div>
        </>
    );
};