'use client';

import SpeedMeter from '@/components/speed-meter/speed-meter';
import { findEngineWithDetail, RPM_GAUGE_MAX } from '@/data/nura/engine-data';
import { useVesselEngineData } from '@/hooks/use-api-data';
import { Text } from 'rizzui/typography';

// ─── Gauge max values ────────────────────────────────────────────────────────

const LUBEOIL_PRESS_MAX = 1250; // kPa
const LUBEOIL_TEMP_MAX = 250; // °C
const COOLANT_PRESS_MAX = 500; // kPa
const COOLANT_TEMP_MAX = 360; // °C

// ─── Stat card ───────────────────────────────────────────────────────────────

function StatCard({
  label,
  unit,
  value,
}: {
  label: string;
  unit: string;
  value: string;
}) {
  return (
    <div className="mt-20 rounded-lg bg-background p-3 text-center shadow-lg">
      <h6 className="mb-1 text-xs font-semibold leading-tight text-muted-foreground">
        {label}
        <br />
        {unit}
      </h6>
      <span className="text-lg font-bold text-primary">{value}</span>
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

interface EngineDetailViewProps {
  vesselId: number;
  engineId: string;
  latestME?: Record<string, any>;
  latestAE?: Record<string, any>;
}

export default function EngineDetailView({
  vesselId,
  engineId,
  latestME = {},
  latestAE = {},
}: EngineDetailViewProps) {
  // Try API data first, fall back to mock
  const { mainEngines, gensets } = useVesselEngineData(vesselId);
  const apiEngine = [...mainEngines, ...gensets].find((e) => e.id === engineId);
  let engine = apiEngine?.detail
    ? apiEngine
    : findEngineWithDetail(vesselId, engineId);

  // Overlay live socket data
  if (engine) {
    const socketKey = engine.id.toUpperCase();
    const live = latestME[socketKey] ?? latestAE[socketKey];
    if (live) {
      const shouldKeepDemoValues =
        vesselId === 1 && (engine.id === 'me1' || engine.id === 'me2');

      engine = {
        ...engine,
        gauge: {
          engine_rpm: live.engine_rpm ?? engine.gauge.engine_rpm,
          engine_load: shouldKeepDemoValues
            ? engine.gauge.engine_load
            : (live.engine_load ?? engine.gauge.engine_load),
          fuel_cons: shouldKeepDemoValues
            ? engine.gauge.fuel_cons
            : (live.fuel_cons ?? engine.gauge.fuel_cons),
        },
        detail: engine.detail
          ? {
              ...engine.detail,
              lubeoil_press: live.lubeoil_press ?? engine.detail.lubeoil_press,
              lubeoil_temp: live.lubeoil_temp ?? engine.detail.lubeoil_temp,
              coolant_press: live.coolant_press ?? engine.detail.coolant_press,
              coolant_temp: live.coolant_temp ?? engine.detail.coolant_temp,
              batt_volt: live.Batt_volt ?? engine.detail.batt_volt,
              exhgas_temp_left:
                live.exhgas_temp_left ?? engine.detail.exhgas_temp_left,
              exhgas_temp_right:
                live.exhgas_temp_right ?? engine.detail.exhgas_temp_right,
            }
          : undefined,
      };
    }
  }

  if (!engine) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Text className="italic text-muted-foreground">
          No data available for this engine
        </Text>
      </div>
    );
  }

  const d = engine.detail ?? {
    lubeoil_press: 0,
    lubeoil_temp: 0,
    coolant_press: 0,
    coolant_temp: 0,
    batt_volt: 0,
    exhgas_temp_left: 0,
    exhgas_temp_right: 0,
  };

  return (
    <div className="py-4">
      {/* Engine label */}
      <h6 className="-mt-8 mb-8 text-center text-lg font-semibold">
        {engine.label}
      </h6>

      {/* Section labels — centered above the gauge cluster */}
      <div className="mx-auto flex justify-between" style={{ maxWidth: 500 }}>
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
      <div className="flex w-full items-center justify-center">
        {/* ─ Outer left: Lube Oil Pressure (sm, clipped right) ─ */}
        <div
          style={{
            width: 280,
            flexShrink: 0,
            marginRight: -130,
            marginTop: 40,
            clipPath: 'polygon(0 0, 75% 0, 55% 100%, 0 100%)',
            overflow: 'hidden',
            zIndex: 1,
          }}
        >
          <SpeedMeter
            bare
            size="default"
            value={d.lubeoil_press}
            max={LUBEOIL_PRESS_MAX}
            centerLabel={`${Number(d.lubeoil_press).toFixed(1)}`}
            unit="kPa"
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
            centerLabel={`${Number(d.lubeoil_temp).toFixed(1)}`}
            unit="°C"
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
            unit="RPM"
            className="border-0"
          />
          {/* Exhaust gas labels */}
          <div className="relative z-10 -mt-10 flex justify-center gap-6">
            <div className="text-center">
              <span className="block text-[10px] text-muted-foreground">
                Left Exhaust
              </span>
              <span className="inline-block rounded bg-green-100 px-1.5 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                {d.exhgas_temp_left.toFixed(1)}
              </span>
            </div>
            <div className="text-center">
              <span className="block text-[10px] text-muted-foreground">
                Right Exhaust
              </span>
              <span className="inline-block rounded bg-green-100 px-1.5 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                {d.exhgas_temp_right.toFixed(1)}
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
            centerLabel={`${Number(d.coolant_press).toFixed(1)}`}
            unit="kPa"
            fillColor="#06B6D4"
            className="border-0"
          />
        </div>

        {/* ─ Outer right: Coolant Temp (sm, clipped left) ─ */}
        <div
          style={{
            width: 250,
            flexShrink: 0,
            marginLeft: -130,
            marginTop: 55,
            clipPath: 'polygon(25% 0, 100% 0, 100% 100%, 45% 100%)',
            overflow: 'hidden',
            zIndex: 1,
          }}
        >
          <SpeedMeter
            bare
            size="default"
            reverseFill
            value={d.coolant_temp}
            max={COOLANT_TEMP_MAX}
            centerLabel={`${Number(d.coolant_temp).toFixed(1)}`}
            unit="°C"
            fillColor="#0891B2"
            className="border-0"
          />
        </div>
      </div>

      {/* Stat cards */}
      <div
        className="mx-auto -mt-8 grid grid-cols-3 gap-4"
        style={{ maxWidth: '60%' }}
      >
        <StatCard
          label="Engine Load"
          unit="(%)"
          value={engine.gauge.engine_load.toFixed(1)}
        />
        <StatCard
          label="Fuel Consumption"
          unit="Rate (l/hr)"
          value={engine.gauge.fuel_cons.toFixed(1)}
        />
        <StatCard
          label="Starting Battery"
          unit="Volt. (VDC)"
          value={d.batt_volt.toFixed(1)}
        />
      </div>
    </div>
  );
}
