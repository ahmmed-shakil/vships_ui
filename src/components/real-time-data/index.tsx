'use client';

import { useSocketData } from '@/app/shared/hooks/useSocket';
import {
  computeGKWH,
  FUEL_GAUGE_MAX,
  RPM_GAUGE_MAX,
  type EngineMonitorData,
} from '@/data/nura/engine-data';
import { useVesselAlarmData, useVesselEngineData } from '@/hooks/use-api-data';
import {
  selectedEngineAtom,
  selectedShipAtom,
} from '@/store/condition-monitoring-atoms';
import cn from '@/utils/class-names';
import { useAtom } from 'jotai';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { Text } from 'rizzui/typography';

// ─── Helper: overlay live socket data onto an engine ─────────────────────────

function applyLiveData(
  engine: EngineMonitorData | undefined,
  latestME: Record<string, any>,
  latestAE: Record<string, any>,
  latestDG: Record<string, any>,
  vesselId?: number
): EngineMonitorData | undefined {
  if (!engine) return undefined;
  const socketKey = engine.id.toUpperCase(); // "me1" → "ME1"
  const live = latestDG[socketKey] ?? latestME[socketKey] ?? latestAE[socketKey];
  if (!live) return engine;

  const liveRpm = live.engine_rpm ?? engine.gauge.engine_rpm;
  const liveLoad = live.engine_load ?? engine.gauge.engine_load;
  const liveFuelCons = live.fuel_cons ?? engine.gauge.fuel_cons;
  const liveRunHrs = live.run_hrs_counter ?? engine.totals.running_hours;
  const liveTotalFuel = live.total_fuel ?? engine.totals.total_fuel;

  // FM Cons (kg/h) = fuel_cons (L/h) × 0.85, FM In = FM Cons + FM Out
  const fmCons = liveFuelCons * 0.85;
  const fmOut = engine.flowMeter.fm_out;
  const fmIn = fmCons + fmOut;

  return {
    ...engine,
    gauge: {
      engine_rpm: liveRpm,
      engine_load: liveLoad,
      fuel_cons: liveFuelCons,
    },
    flowMeter: {
      fm_in: fmIn,
      fm_cons: fmCons,
      fm_out: fmOut,
    },
    totals: {
      running_hours: liveRunHrs,
      total_fuel: liveTotalFuel,
    },
    detail: engine.detail
      ? {
        ...engine.detail,
        lubeoil_press: live.lubeoil_press ?? engine.detail.lubeoil_press,
        lubeoil_temp: live.lubeoil_temp ?? engine.detail.lubeoil_temp,
        coolant_press: live.coolant_press ?? engine.detail.coolant_press,
        coolant_temp: live.coolant_temp ?? engine.detail.coolant_temp,
        lt_coolant_press: live.lt_coolant_press ?? engine.detail.lt_coolant_press,
        fuel_oil_press: live.fuel_oil_press ?? engine.detail.fuel_oil_press,
        start_air_press: live.start_air_press ?? engine.detail.start_air_press,
        batt_volt: live.Batt_volt ?? engine.detail.batt_volt,
        exhgas_temp_left:
          live.exhgas_temp_left ?? engine.detail.exhgas_temp_left,
        exhgas_temp_right:
          live.exhgas_temp_right ?? engine.detail.exhgas_temp_right,
      }
      : {
        lubeoil_press: live.lubeoil_press ?? 0,
        lubeoil_temp: live.lubeoil_temp ?? 0,
        coolant_press: live.coolant_press ?? 0,
        coolant_temp: live.coolant_temp ?? 0,
        lt_coolant_press: live.lt_coolant_press ?? 0,
        fuel_oil_press: live.fuel_oil_press ?? 0,
        start_air_press: live.start_air_press ?? 0,
        batt_volt: live.Batt_volt ?? 0,
        exhgas_temp_left: live.exhgas_temp_left ?? 0,
        exhgas_temp_right: live.exhgas_temp_right ?? 0,
      },
  };
}

import SpeedMeter from '../speed-meter/speed-meter';
import AlarmTable from './alarm-table';
import EngineDetailView from './engine-detail-view';

const RealTimeDataMap = dynamic(
  () => import('@/components/operation-overview/real-time-data-map'),
  { ssr: false }
);

// ─── Stat badge (Total Fuel / Run Hrs) ───────────────────────────────────────

function StatRow({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-xs font-semibold text-muted-foreground">
        {label}
      </span>
      <div className="flex items-center gap-1">
        <span className="inline-block rounded bg-primary/10 px-2 py-0.5 font-mono text-xs font-semibold text-primary">
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
  onClick,
}: {
  engine: EngineMonitorData | undefined;
  size?: 'sm' | 'default';
  layout?: 'horizontal' | 'vertical';
  className?: string;
  className2?: string;
  className3?: string;
  onClick?: () => void;
}) {
  if (!engine) {
    return (
      <div className={className}>
        <div className="flex h-full min-h-[120px] items-center justify-center">
          <Text className="text-sm italic text-muted-foreground">No data</Text>
        </div>
      </div>
    );
  }

  const gkwh = computeGKWH(engine.gauge.fuel_cons, engine.gauge.engine_load);

  return (
    <div
      className={cn(
        'flex flex-col',
        className,
        onClick && 'group cursor-pointer'
      )}
      onClick={onClick}
    >
      <div
        className={
          layout === 'horizontal' ? 'grid grid-cols-2' : 'flex flex-col gap-2'
        }
      >
        <SpeedMeter
          bare
          size={size}
          value={engine.gauge.engine_rpm}
          max={RPM_GAUGE_MAX}
          centerLabel={`${engine.gauge.engine_rpm.toFixed(0)}`}
          unit="RPM"
          className="border-0"
        />
        {/* Fuel meter */}
        <SpeedMeter
          bare
          size={size}
          value={gkwh}
          max={FUEL_GAUGE_MAX}
          min={140}
          centerLabel={`${gkwh}`}
          unit="g/Kwh"
          fillColor="#00858D"
          className={cn('border-0', className2)}
        />
      </div>
      {/* Stats */}
      <div
        className={cn(
          'flex justify-center gap-4',
          layout === 'horizontal' ? '-mt-6' : 'mt-2',
          className3
        )}
      >
        <StatRow
          label="Total Fuel"
          value={engine.totals.total_fuel.toFixed(2)}
          unit={
            <>
              M<sup>3</sup>
            </>
          }
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

// ─── Layout ──────────────────────────────────────────────────────────────────

export const RealTimeDataLayout = () => {
  const [selectedShip] = useAtom(selectedShipAtom);

  if (!selectedShip) {
    return (
      <div className="flex h-96 items-center justify-center">
        <span className="text-muted-foreground">Loading vessel data…</span>
      </div>
    );
  }

  return <RealTimeDataContent />;
};

const RealTimeDataContent = () => {
  const [selectedShip] = useAtom(selectedShipAtom);
  const [selectedEngine, setSelectedEngine] = useAtom(selectedEngineAtom);
  const { data: session } = useSession();
  const token = (session as any)?.accessToken ?? null;
  const { latestME, latestAE, latestDG } = useSocketData(selectedShip.id, token);

  // Fetch engine data from API (falls back to mock)
  const vesselId = selectedShip.id;
  const { mainEngines } = useVesselEngineData(vesselId);

  // Fetch alarm data from API (falls back to mock), filtered by engine
  const alarmEngine =
    selectedEngine.value !== 'all' ? selectedEngine.value : undefined;
  const rawAlarms = useVesselAlarmData(vesselId, alarmEngine);
  const alarms = useMemo(() => {
    return rawAlarms.map((a) => ({
      ...a,
      date: a.timestamp,
      time: a.timestamp,
    }));
  }, [rawAlarms]);

  // Lookup engine data for the selected vessel, overlaid with live socket data
  const enginesData = mainEngines.map((engine) =>
    applyLiveData(engine, latestME, latestAE, latestDG, vesselId)
  );

  return (
    <>
      {/* main grid */}
      <div className="grid grid-cols-4 shadow-lg">
        <div className="col-span-3 mt-2">
          {selectedEngine.value === 'all' ? (
            /* ── All Engine: 2x3 grid layout ── */
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 px-4">
              {enginesData.map((engine) => (
                <div
                  key={engine?.id}
                  className="rounded-xl border p-4 shadow-sm"
                >
                  <h6
                    className="mb-4 cursor-pointer text-center text-sm font-semibold uppercase transition-colors hover:text-primary"
                    onClick={() =>
                      engine &&
                      setSelectedEngine({
                        label: engine.label,
                        value: engine.id,
                      })
                    }
                  >
                    {engine?.label}
                  </h6>
                  <EngineGroup
                    engine={engine}
                    layout="horizontal"
                    onClick={() =>
                      engine &&
                      setSelectedEngine({
                        label: engine.label,
                        value: engine.id,
                      })
                    }
                  />
                </div>
              ))}
            </div>
          ) : (
            /* ── Individual Engine: lube oil / coolant view ── */
            <EngineDetailView
              vesselId={vesselId}
              engineId={selectedEngine.value}
              latestME={latestME}
              latestAE={latestAE}
              latestDG={latestDG}
            />
          )}
        </div>

        {/* Map */}
        <RealTimeDataMap
          name={selectedShip.label}
          lat={selectedShip.position?.lat ?? 0}
          long={selectedShip.position?.long ?? 0}
          direction={selectedShip.position?.direction ?? 0}
          timestamp={selectedShip.position?.timestamp ?? 0}
          minHeight={500}
        />
      </div>

      {/* Alarm table + Machinery score */}
      <div className="mt-4 grid grid-cols-4 gap-4">
        <AlarmTable
          data={alarms}
          title={`Alarms — ${selectedShip.label}`}
          className="col-span-full"
        />
        {/* <MachineryScoreTable vesselId={vesselId} className="col-span-1" /> */}
      </div>
    </>
  );
};
