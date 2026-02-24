'use client';

import SpeedMeter from '@/components/speed-meter/speed-meter';
import {
    findEngineWithDetail,
    RPM_GAUGE_MAX,
} from '@/data/nura/engine-data';
import { Text } from 'rizzui/typography';

// ─── Gauge max values ────────────────────────────────────────────────────────

const LUBEOIL_PRESS_MAX = 1250;  // kPa
const LUBEOIL_TEMP_MAX = 250;    // °C
const COOLANT_PRESS_MAX = 500;   // kPa
const COOLANT_TEMP_MAX = 360;    // °C

// ─── Stat card ───────────────────────────────────────────────────────────────

function StatCard({ label, unit, value }: { label: string; unit: string; value: string }) {
    return (
        <div className="rounded-lg bg-background shadow-lg p-3 text-center mt-20">
            <h6 className="text-xs font-semibold text-muted-foreground mb-1 leading-tight">
                {label}<br />{unit}
            </h6>
            <span className="text-lg font-bold text-primary">{value}</span>
        </div>
    );
}

// ─── Component ───────────────────────────────────────────────────────────────

interface EngineDetailViewProps {
    vesselId: number;
    engineId: string;
}

export default function EngineDetailView({ vesselId, engineId }: EngineDetailViewProps) {
    const engine = findEngineWithDetail(vesselId, engineId);

    if (!engine) {
        return (
            <div className="flex items-center justify-center min-h-[300px]">
                <Text className="text-muted-foreground italic">
                    No data available for this engine
                </Text>
            </div>
        );
    }

    const d = engine.detail ?? {
        lubeoil_press: 0, lubeoil_temp: 0,
        coolant_press: 0, coolant_temp: 0,
        batt_volt: 0, exhgas_temp_left: 0, exhgas_temp_right: 0,
    };

    return (
        <div className="py-4">
            {/* Engine label */}
            <h6 className="font-semibold">{engine.label}</h6>

            {/* Section labels — centered above the gauge cluster */}
            <div className="flex justify-between mx-auto" style={{ maxWidth: 500 }}>
                <h6 className="text-sm font-semibold">Lube Oil</h6>
                <h6 className="text-sm font-semibold">Coolant</h6>
            </div>

            {/*
        5 overlapping meters:
        - Each wrapper has an explicit fixed width so ResponsiveContainer renders properly
        - flexShrink: 0 prevents compression
        - Negative margins create overlap
        - clip-path hides the overlapped portions
        - z-index layers them correctly
      */}
            <div
                className="flex items-center justify-center w-full"
            >
                {/* ─ Outer left: Lube Oil Pressure (sm, clipped right) ─ */}
                <div
                    style={{
                        width: 280,
                        flexShrink: 0,
                        marginRight: -125,
                        marginTop: 40,
                        clipPath: 'polygon(0 0, 75% 0, 55% 100%, 0 100%)',
                        overflow: 'hidden',
                        zIndex: 1,
                    }}
                >
                    <SpeedMeter
                        bare
                        size="sm"
                        value={d.lubeoil_press}
                        max={LUBEOIL_PRESS_MAX}
                        centerLabel={`${d.lubeoil_press}`}
                        fillColor="#6366F1"
                        className="border-0"
                    />
                </div>

                {/* ─ Inner left: Lube Oil Temp (default, clipped right) ─ */}
                <div
                    style={{
                        width: 280,
                        flexShrink: 0,
                        marginRight: -120,
                        clipPath: 'polygon(0 0, 85% 0, 50% 100%, 0 100%)',
                        overflow: 'hidden',
                        zIndex: 2,
                    }}
                >
                    <SpeedMeter
                        bare
                        value={d.lubeoil_temp}
                        max={LUBEOIL_TEMP_MAX}
                        centerLabel={`${d.lubeoil_temp}`}
                        fillColor="#8B5CF6"
                        className="border-0"
                    />
                </div>

                {/* ─ Center: RPM (lg, full width) ─ */}
                <div
                    style={{
                        width: 300,
                        flexShrink: 0,
                        zIndex: 3,
                    }}
                >
                    <SpeedMeter
                        bare
                        size="lg"
                        value={engine.gauge.engine_rpm}
                        max={RPM_GAUGE_MAX}
                        centerLabel={`${engine.gauge.engine_rpm.toFixed(0)}`}
                        className="border-0"
                    />
                    {/* Exhaust gas labels */}
                    <div className="flex justify-center gap-6 -mt-10 relative z-10">
                        <div className="text-center">
                            <span className="block text-[10px] text-muted-foreground">Left Exhaust</span>
                            <span className="inline-block rounded bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 text-xs font-semibold text-green-700 dark:text-green-400">
                                {d.exhgas_temp_left.toFixed(2)}
                            </span>
                        </div>
                        <div className="text-center">
                            <span className="block text-[10px] text-muted-foreground">Right Exhaust</span>
                            <span className="inline-block rounded bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 text-xs font-semibold text-green-700 dark:text-green-400">
                                {d.exhgas_temp_right.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ─ Inner right: Coolant Pressure (default, clipped left) ─ */}
                <div
                    style={{
                        width: 280,
                        flexShrink: 0,
                        marginLeft: -120,
                        marginTop: 20,
                        clipPath: 'polygon(25% 0, 100% 0, 100% 100%, 25% 100%)',
                        overflow: 'hidden',
                        zIndex: 2,
                    }}
                >
                    <SpeedMeter
                        bare
                        reverseFill
                        value={d.coolant_press}
                        max={COOLANT_PRESS_MAX}
                        centerLabel={`${d.coolant_press}`}
                        fillColor="#06B6D4"
                        className="border-0"
                    />
                </div>

                {/* ─ Outer right: Coolant Temp (sm, clipped left) ─ */}
                <div
                    style={{
                        width: 250,
                        flexShrink: 0,
                        marginLeft: -110,
                        marginTop: 55,
                        clipPath: 'polygon(25% 0, 100% 0, 100% 100%, 45% 100%)',
                        overflow: 'hidden',
                        zIndex: 1,
                    }}
                >
                    <SpeedMeter
                        bare
                        size="sm"
                        reverseFill
                        value={d.coolant_temp}
                        max={COOLANT_TEMP_MAX}
                        centerLabel={`${d.coolant_temp}`}
                        fillColor="#0891B2"
                        className="border-0"
                    />
                </div>
            </div>

            {/* Stat cards */}
            <div
                className="grid grid-cols-3 gap-4 mx-auto -mt-8"
                style={{ maxWidth: '60%' }}
            >
                <StatCard
                    label="Engine Load"
                    unit="(%)"
                    value={engine.gauge.engine_load.toFixed(2)}
                />
                <StatCard
                    label="Fuel Consumption"
                    unit="Rate (l/hr)"
                    value={engine.gauge.fuel_cons.toFixed(2)}
                />
                <StatCard
                    label="Starting Battery"
                    unit="Volt. (VDC)"
                    value={d.batt_volt.toFixed(2)}
                />
            </div>
        </div>
    );
}
