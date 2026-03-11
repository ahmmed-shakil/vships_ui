'use client';

import { useSocketData } from '@/app/shared/hooks/useSocket';
import { engineValueToAlarmEngine, vesselAlarmData } from '@/data/nura/alarm-data';
import {
  computeGKWH,
  findEngine,
  FUEL_GAUGE_MAX,
  RPM_GAUGE_MAX,
  vesselGensetData,
  type EngineMonitorData,
} from '@/data/nura/engine-data';
import {
  selectedEngineAtom,
  selectedShipAtom,
} from '@/store/condition-monitoring-atoms';
import cn from '@/utils/class-names';
import { useAtom } from 'jotai';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { Text } from 'rizzui/typography';

// ─── Helper: overlay live socket data onto an engine ─────────────────────────

function applyLiveData(
  engine: EngineMonitorData | undefined,
  latestME: Record<string, any>,
  latestAE: Record<string, any>
): EngineMonitorData | undefined {
  if (!engine) return undefined;
  const socketKey = engine.id.toUpperCase(); // "me1" → "ME1"
  const live = latestME[socketKey] ?? latestAE[socketKey];
  if (!live) return engine;

  const liveRpm = live.engine_rpm ?? engine.gauge.engine_rpm;
  const liveLoad = live.engine_load ?? engine.gauge.engine_load;
  const liveFuelCons = live.fuel_cons ?? engine.gauge.fuel_cons;
  const liveRunHrs = live.run_hrs_counter ?? engine.totals.running_hours;
  const liveTotalFuel = live.total_fuel ?? engine.totals.total_fuel;

  return {
    ...engine,
    gauge: {
      engine_rpm: liveRpm,
      engine_load: liveLoad,
      fuel_cons: liveFuelCons,
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
        batt_volt: live.Batt_volt ?? engine.detail.batt_volt,
        exhgas_temp_left:
          live.exhgas_temp_left ?? engine.detail.exhgas_temp_left,
        exhgas_temp_right:
          live.exhgas_temp_right ?? engine.detail.exhgas_temp_right,
      }
      : undefined,
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
  fuelValueOverride,
}: {
  engine: EngineMonitorData | undefined;
  size?: 'sm' | 'default';
  layout?: 'horizontal' | 'vertical';
  className?: string;
  className2?: string;
  className3?: string;
  onClick?: () => void;
  fuelValueOverride?: number;
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

  const gkwh = fuelValueOverride ?? computeGKWH(engine.gauge.fuel_cons, engine.gauge.engine_load);

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

// ─── Small engine pair (Genset): side-by-side in a 2-col grid ────────────────

function GensetGroup({
  engine,
  label,
  className,
  onClick,
}: {
  engine: EngineMonitorData | undefined;
  label: string;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      className={cn(className, onClick && 'group cursor-pointer')}
      onClick={onClick}
    >
      <h6
        className={cn(
          'col-span-full mt-auto text-center text-sm font-semibold',
          onClick && 'transition-colors group-hover:text-primary'
        )}
      >
        {label}
      </h6>
      <EngineGroup engine={engine} size="sm" layout="horizontal" />
    </div>
  );
}

// ─── Layout ──────────────────────────────────────────────────────────────────

export const RealTimeDataLayout = () => {
  const [selectedShip] = useAtom(selectedShipAtom);
  const [selectedEngine, setSelectedEngine] = useAtom(selectedEngineAtom);
  const { latestME, latestAE } = useSocketData();

  // Get alarm data for the selected vessel and filter by engine
  const alarms = useMemo(() => {
    const rawAlarms = vesselAlarmData[selectedShip.id] ?? [];
    let filtered = rawAlarms;

    if (selectedEngine.value !== 'all') {
      const alarmEngineName = engineValueToAlarmEngine[selectedEngine.value];
      if (alarmEngineName) {
        filtered = rawAlarms.filter((a) => a.engine === alarmEngineName);
      }
    }

    // Add date/time proxy fields so the generic table sorter can sort them
    return filtered.map((a) => ({
      ...a,
      date: a.timestamp,
      time: a.timestamp,
    }));
  }, [selectedShip.id, selectedEngine.value]);

  // Lookup engine data for the selected vessel, overlaid with live socket data
  const vesselId = selectedShip.id;
  const mePort = applyLiveData(findEngine(vesselId, 'me1'), latestME, latestAE);
  const meStbd = applyLiveData(findEngine(vesselId, 'me2'), latestME, latestAE);
  const meCenter = applyLiveData(
    findEngine(vesselId, 'me3'),
    latestME,
    latestAE
  );
  const gensets = vesselGensetData[vesselId] ?? [];
  const genset1 = applyLiveData(
    gensets.find((e) => e.id === 'ae1'),
    latestME,
    latestAE
  );
  const genset2 = applyLiveData(
    gensets.find((e) => e.id === 'ae2'),
    latestME,
    latestAE
  );

  return (
    <>
      {/* main grid */}
      <div className="mt-4 grid grid-cols-4 shadow-lg">
        <div className="col-span-3 mt-2">
          {selectedEngine.value === 'all' ? (
            /* ── All Engine: 10-meter layout (DO NOT MODIFY LAYOUT) ── */
            <div className="grid grid-cols-12">
              {/* Labels */}
              <div className="col-span-full flex justify-around uppercase">
                <h6
                  className="cursor-pointer font-semibold transition-colors hover:text-primary"
                  onClick={() =>
                    setSelectedEngine({ label: 'ME Port', value: 'me1' })
                  }
                >
                  ME Port
                </h6>
                <h6
                  className="cursor-pointer font-semibold transition-colors hover:text-primary"
                  onClick={() =>
                    setSelectedEngine({ label: 'ME Stbd', value: 'me2' })
                  }
                >
                  ME STBD
                </h6>
              </div>

              {/* Row 1: ME PORT (RPM + Fuel) | ME STBD (RPM + Fuel) */}
              <EngineGroup
                engine={mePort}
                className="col-span-6"
                onClick={() =>
                  setSelectedEngine({ label: 'ME Port', value: 'me1' })
                }
                fuelValueOverride={202.5}
              />
              <EngineGroup
                engine={meStbd}
                className="col-span-6"
                onClick={() =>
                  setSelectedEngine({ label: 'ME Stbd', value: 'me2' })
                }
                fuelValueOverride={203.9}
              />

              {/* Row 2: Genset 1 | ME CENTER | Genset 2 */}
              <GensetGroup
                engine={genset1}
                label="Genset 1"
                className="z-0 col-span-4 my-auto"
                onClick={() =>
                  setSelectedEngine({ label: 'AE1', value: 'ae1' })
                }
              />
              <div className="relative col-span-4 m-0 -mt-10 p-0">
                {/* Half-height border lines */}
                <div className="absolute bottom-1/4 left-0 top-1/4 w-0.5 bg-gray-300 dark:bg-gray-600" />
                <div className="absolute bottom-1/4 right-0 top-1/4 w-0.5 bg-gray-300 dark:bg-gray-600" />
                <h6
                  className="cursor-pointer text-center text-sm font-semibold uppercase transition-colors hover:text-primary"
                  onClick={() =>
                    setSelectedEngine({ label: 'ME Center', value: 'me3' })
                  }
                >
                  ME Center
                </h6>
                <EngineGroup
                  engine={meCenter}
                  layout="vertical"
                  className2="-mt-20"
                  className3="-mt-10"
                  onClick={() =>
                    setSelectedEngine({ label: 'ME Center', value: 'me3' })
                  }
                />
              </div>
              <GensetGroup
                engine={genset2}
                label="Genset 2"
                className="z-0 col-span-4 my-auto"
                onClick={() =>
                  setSelectedEngine({ label: 'AE2', value: 'ae2' })
                }
              />
            </div>
          ) : (
            /* ── Individual Engine: lube oil / coolant view ── */
            <EngineDetailView
              vesselId={vesselId}
              engineId={selectedEngine.value}
              latestME={latestME}
              latestAE={latestAE}
            />
          )}
        </div>

        {/* Map */}
        <RealTimeDataMap
          name={selectedShip.label}
          lat={selectedShip.position.lat}
          long={selectedShip.position.long}
          direction={selectedShip.position.direction}
          timestamp={selectedShip.position.timestamp}
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
