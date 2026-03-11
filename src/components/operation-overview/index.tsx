'use client';

import WidgetCard from '@/components/cards/widget-card';
import SpeedMeter from '@/components/speed-meter/speed-meter';
import {
  computeGKWH,
  computeKW,
  FUEL_GAUGE_MAX,
  RPM_GAUGE_MAX,
  vesselEngineData,
  vesselGensetData,
  type EngineMonitorData,
} from '@/data/nura/engine-data';
import { getChartData } from '@/data/nura/operation-monitor-charts-data';
import { useSocketData } from '@/app/shared/hooks/useSocket';
import { selectedShipAtom } from '@/store/condition-monitoring-atoms';
import { useAtomValue } from 'jotai';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { Box } from 'rizzui/box';
import ConsumptionVsSpeedChart from './consumption-vs-speed-chart';
import EngineConsumptionChart from './engine-consumption-chart';

const RealTimeDataMap = dynamic(
  () => import('@/components/operation-overview/real-time-data-map'),
  { ssr: false }
);

// ─── Flow-meter row component ────────────────────────────────────────────────

function FlowMeterRow({
  label,
  value,
  unit,
}: {
  label: string;
  value: number;
  unit: string;
}) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <div className="flex items-baseline gap-1.5">
        <span className="text-lg font-bold tracking-tight text-foreground">
          {value.toFixed(2)}
        </span>
        <span className="w-8 text-right text-xs font-medium text-muted-foreground">
          {unit}
        </span>
      </div>
    </div>
  );
}

// ─── Stat badge component ────────────────────────────────────────────────────

function StatBadge({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-start">
      <span className="mb-1 text-xs font-semibold">{label}</span>
      <div className="flex items-center gap-1">
        <span className="inline-block rounded bg-primary/10 px-3 py-0.5 font-mono text-sm font-semibold text-primary">
          {value}
        </span>
        <span className="text-xs">{unit}</span>
      </div>
    </div>
  );
}

// ─── Engine Monitor Card ─────────────────────────────────────────────────────

function EngineMonitorCard({ engine }: { engine: EngineMonitorData }) {
  const kw = computeKW(engine.gauge.engine_load);
  const gkwh = computeGKWH(engine.gauge.fuel_cons, engine.gauge.engine_load);

  return (
    <WidgetCard
      title={engine.label}
      className="lg:p-2"
      titleClassName="font-inter text-center"
      headerClassName="justify-center"
    >
      {/* RPM Gauge */}
      <div className="">
        <SpeedMeter
          bare
          title={engine.label}
          value={engine.gauge.engine_rpm}
          max={RPM_GAUGE_MAX}
          centerLabel={`${engine.gauge.engine_rpm.toFixed(1)}`}
          unit="RPM"
          gaugeHeight={220}
        />
        <div className="-mt-20 flex items-center justify-center gap-6">
          <div className="text-center">
            <span className="text-xs text-muted-foreground">
              {engine.label}
            </span>
          </div>
        </div>
        <div className="mt-1 flex items-center justify-center">
          <span className="inline-block rounded bg-primary/10 px-3 py-0.5 font-mono text-sm font-semibold text-primary">
            {kw}
          </span>
          <span className="ml-2 text-xs text-muted-foreground">kw</span>
        </div>
      </div>

      {/* Fuel Gauge */}
      <div className="mt-4">
        <SpeedMeter
          bare
          title={engine.label}
          value={gkwh}
          max={FUEL_GAUGE_MAX}

          min={140}
          centerLabel={`${gkwh}`}
          unit="g/Kwh"
          fillColor="#00858D"
          gaugeHeight={220}
        />
        <div className="-mt-20 flex items-center justify-center gap-6">
          <div className="text-center">
            <span className="text-xs text-muted-foreground">
              {engine.label}
            </span>
          </div>
        </div>
        <div className="mt-1 flex items-center justify-center">
          <span className="inline-block rounded bg-primary/10 px-3 py-0.5 font-mono text-sm font-semibold text-primary">
            {engine.gauge.fuel_cons.toFixed(1)}
          </span>
          <span className="ml-2 text-xs text-muted-foreground">L/H</span>
        </div>
      </div>

      {/* Totals */}
      <div className="mt-6 flex justify-center gap-6">
        <StatBadge
          label="Total Fuel"
          value={engine.totals.total_fuel.toFixed(2)}
          unit={
            <>
              M<sup>3</sup>
            </>
          }
        />
        <StatBadge
          label="Run Hrs"
          value={engine.totals.running_hours.toFixed(2)}
          unit="H"
        />
      </div>

      {/* FM data */}
      <div className="mx-auto mt-3 max-w-[300px] space-y-1.5 rounded-lg bg-transparent p-3 shadow-2xl">
        <FlowMeterRow
          label="FM in"
          value={engine.flowMeter.fm_in}
          unit="kg/h"
        />
        <FlowMeterRow
          label="FM Cons"
          value={engine.flowMeter.fm_cons}
          unit="kg/h"
        />
        {/* <FlowMeterRow label="FM out" value={engine.flowMeter.fm_out} unit="kg/h" /> */}
        <FlowMeterRow
          label="FM out"
          value={engine.flowMeter.fm_in - engine.flowMeter.fm_cons}
          unit="kg/h"
        />
      </div>
    </WidgetCard>
  );
}

// ─── Live Socket Data Card (temporary) ───────────────────────────────────────

function LiveSocketDataRow({
  label,
  value,
  unit,
}: {
  label: string;
  value: number | string | null;
  unit?: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-muted/30 py-1.5 last:border-b-0">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className="font-mono text-sm font-semibold text-foreground">
          {value != null
            ? typeof value === 'number'
              ? value.toFixed(2)
              : value
            : '—'}
        </span>
        {unit && (
          <span className="text-[10px] text-muted-foreground">{unit}</span>
        )}
      </div>
    </div>
  );
}

function LiveEngineCard({ data }: { data: any }) {
  return (
    <div className="rounded-lg border border-muted/40 bg-background p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-sm font-bold">{data.engineId}</h4>
        <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
          {data.type}
        </span>
      </div>
      <div className="space-y-0">
        <LiveSocketDataRow label="RPM" value={data.engine_rpm} />
        <LiveSocketDataRow
          label="Engine Load"
          value={data.engine_load}
          unit="%"
        />
        <LiveSocketDataRow
          label="Fuel Cons"
          value={data.fuel_cons}
          unit="L/h"
        />
        <LiveSocketDataRow
          label="Coolant Temp"
          value={data.coolant_temp}
          unit="°C"
        />
        <LiveSocketDataRow
          label="Coolant Press"
          value={data.coolant_press}
          unit="bar"
        />
        <LiveSocketDataRow
          label="Lube Oil Temp"
          value={data.lubeoil_temp}
          unit="°C"
        />
        <LiveSocketDataRow
          label="Lube Oil Press"
          value={data.lubeoil_press}
          unit="bar"
        />
        <LiveSocketDataRow
          label="Exh Temp Mean"
          value={data.exh_temp_mean}
          unit="°C"
        />
        <LiveSocketDataRow
          label="Fuel Press"
          value={data.fuel_press}
          unit="bar"
        />
        <LiveSocketDataRow
          label="Boost Air Press"
          value={data.boostair_press}
          unit="bar"
        />
        <LiveSocketDataRow
          label="Intake Air Temp"
          value={data.intakeair_temp}
          unit="°C"
        />
        <LiveSocketDataRow
          label="Run Hrs"
          value={data.run_hrs_counter}
          unit="h"
        />
        <LiveSocketDataRow label="Batt Volt" value={data.Batt_volt} unit="V" />
        {data.timestamp && (
          <LiveSocketDataRow label="Timestamp" value={data.timestamp} />
        )}
        <LiveSocketDataRow
          label="Last Received"
          value={
            data._receivedAt
              ? new Date(data._receivedAt).toLocaleTimeString()
              : '—'
          }
        />
      </div>
    </div>
  );
}

function LiveSocketCard({
  latestME,
  latestAE,
  meCount,
  aeCount,
  connected,
}: {
  latestME: Record<string, any>;
  latestAE: Record<string, any>;
  meCount: number;
  aeCount: number;
  connected: boolean;
}) {
  const meEntries = Object.values(latestME);
  const aeEntries = Object.values(latestAE);
  const hasData = meEntries.length > 0 || aeEntries.length > 0;

  return (
    <WidgetCard
      title={
        <div className="flex items-center gap-2">
          <span>Live Socket Data</span>
          <span
            className={`inline-block h-2.5 w-2.5 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'
              }`}
          />
          <span className="text-xs font-normal text-muted-foreground">
            {hasData
              ? `${meCount} ME / ${aeCount} AE events`
              : 'Connecting to socket.perfomax.tech…'}
          </span>
        </div>
      }
      className="mb-6"
    >
      {!hasData && (
        <p className="py-4 text-center text-sm text-muted-foreground">
          Waiting for data…
        </p>
      )}
      {hasData && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {meEntries.map((d) => (
            <LiveEngineCard key={d.engineId} data={d} />
          ))}
          {aeEntries.map((d) => (
            <LiveEngineCard key={d.engineId} data={d} />
          ))}
        </div>
      )}
    </WidgetCard>
  );
}

// ─── Real Time Data Layout ──────────────────────────────────────────────────

const OperationOverviewLayout = () => {
  const vessel = useAtomValue(selectedShipAtom);
  const { latestME, latestAE, meTotalCount, aeTotalCount, connected } =
    useSocketData();

  // Engine data for the selected vessel, overlaid with live socket values
  const baseEngines = vesselEngineData[vessel.id] ?? [];
  const engines = baseEngines.map((engine) => {
    const socketKey = engine.id.toUpperCase(); // "me1" → "ME1"
    const live = latestME[socketKey];
    if (!live) return engine;

    // For Ocean Voyager (ID 1), we want to keep the demo values for fuel consumption and load
    const shouldKeepDemoValues = vessel.id === 1 && (engine.id === 'me1' || engine.id === 'me2');

    const liveRpm = live.engine_rpm ?? engine.gauge.engine_rpm;
    const liveLoad = shouldKeepDemoValues ? engine.gauge.engine_load : (live.engine_load ?? engine.gauge.engine_load);
    const liveFuelCons = shouldKeepDemoValues ? engine.gauge.fuel_cons : (live.fuel_cons ?? engine.gauge.fuel_cons);

    // FM Cons = fuel_cons × 0.8, FM In = FM Cons + FM Out
    const fmCons = liveFuelCons * 0.8;
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
    };
  });

  // Chart data for the selected vessel (memoized to avoid re-generating on every render)
  const chartData = useMemo(() => getChartData(vessel.id), [vessel.id]);

  // Consumption vs Speed: scale chart data close to socket ME values, last row = exact socket value
  const consumptionVsSpeedData = useMemo(() => {
    const baseData = chartData.consumptionVsSpeed;
    if (Object.keys(latestME).length === 0) return baseData;

    const engineKeys = baseEngines.map((e) => e.id);
    const socketFuelCons: Record<string, number> = {};
    engineKeys.forEach((key) => {
      const live = latestME[key.toUpperCase()];
      if (live?.fuel_cons != null) socketFuelCons[key] = live.fuel_cons;
    });

    if (Object.keys(socketFuelCons).length === 0) return baseData;

    return baseData.map((point, i) => {
      const isLast = i === baseData.length - 1;
      const newPoint = { ...point };
      Object.keys(socketFuelCons).forEach((key) => {
        const socketVal = socketFuelCons[key];
        const lastStaticVal = Number(baseData[baseData.length - 1][key]) || 1;
        const ratio = socketVal / lastStaticVal;
        if (isLast) {
          newPoint[key] = Number(socketVal.toFixed(1));
        } else {
          newPoint[key] = Number(
            ((Number(point[key]) || 0) * ratio).toFixed(1)
          );
        }
      });
      return newPoint;
    });
  }, [chartData.consumptionVsSpeed, latestME, baseEngines]);

  // Genset consumption chart data generated from socket AE values
  const gensetCount = vesselGensetData[vessel.id]?.length ?? 2;
  const gensetChartData = useMemo(() => {
    // Filter hours to current Singapore time (UTC+8) — same logic as operation-monitor-charts-data.ts
    // const ALL_HOURS = [
    //   '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
    //   '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
    // ];
    const ALL_HOURS = [
      '00:00', '01:00', '02:00', '03:00', '04:00', '05:00',
      '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
      '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
      '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
    ];
    const sgtHour = new Date(
      new Date().toLocaleString('en-US', { timeZone: 'Asia/Singapore' })
    ).getHours();
    const currentTimeStr = `${String(sgtHour).padStart(2, '0')}:00`;
    const HOURS = ALL_HOURS.filter((h) => h <= currentTimeStr);
    const gensetKeys = ['ae1', 'ae2'].slice(0, gensetCount);
    const aeFuelCons: Record<string, number> = {};
    gensetKeys.forEach((key) => {
      const live = latestAE[key.toUpperCase()];
      aeFuelCons[key] = live?.fuel_cons ?? 0;
    });

    let s = vessel.id * 700;
    const variations: number[] = [];
    for (let i = 0; i < HOURS.length; i++) {
      s = (s * 16807 + 12345) % 2147483647;
      variations.push(0.85 + (s / 2147483647) * 0.3);
    }

    return HOURS.map((time, i) => {
      const point: { time: string;[engine: string]: number | string } = {
        time,
      };
      const isLast = i === HOURS.length - 1;
      gensetKeys.forEach((key) => {
        const base = aeFuelCons[key];
        if (base === 0) {
          point[key] = 0;
        } else if (isLast) {
          point[key] = Number(base.toFixed(1));
        } else {
          const offset = key === 'ae2' ? 0.02 : 0;
          point[key] = Number((base * (variations[i] + offset)).toFixed(1));
        }
      });
      return point;
    });
  }, [vessel.id, latestAE, gensetCount]);

  // Grid columns based on engine count
  const gridCols =
    engines.length > 3
      ? 'lg:grid-cols-4'
      : engines.length === 3
        ? 'lg:grid-cols-3'
        : 'lg:grid-cols-2';

  return (
    <>
      {/* Temporary: Live socket data card */}
      {/* <LiveSocketCard
        latestME={latestME}
        latestAE={latestAE}
        meCount={meTotalCount}
        aeCount={aeTotalCount}
        connected={connected}
      /> */}

      <Box className="@container/pd">
        {/* Row 1 — Engine gauges + Map */}
        <Box className="grid grid-cols-10 gap-4 @container/pd lg:gap-8">
          {/* Left column — 70% */}
          <Box className="col-span-10 lg:col-span-7">
            <Box className={`grid grid-cols-1 gap-4 ${gridCols}`}>
              {engines.map((engine) => (
                <Box
                  key={engine.id}
                  className="col-span-3 shadow-lg sm:col-span-1"
                >
                  <EngineMonitorCard engine={engine} />
                </Box>
              ))}
            </Box>
          </Box>

          {/* Right column — 30% */}
          <Box className="col-span-10 lg:col-span-3">
            <RealTimeDataMap
              name={vessel.label}
              lat={vessel.position.lat}
              long={vessel.position.long}
              direction={vessel.position.direction}
              timestamp={vessel.position.timestamp}
              minHeight={600}
            />
          </Box>
        </Box>

        {/* Row 3 — Consumption vs Speed */}
        <Box className="mt-6 grid grid-cols-1 gap-6 @container/pd lg:mt-8 3xl:gap-8">
          <ConsumptionVsSpeedChart
            data={consumptionVsSpeedData}
            engineCount={engines.length}
          />
        </Box>

        {/* Row 2 — Genset Consumptions */}
        <Box className="mt-6 grid grid-cols-1 gap-6 @container/pd lg:mt-8 3xl:gap-8">
          <EngineConsumptionChart
            data={gensetChartData}
            engineCount={gensetCount}
          />
        </Box>
      </Box>
    </>
  );
};

export default OperationOverviewLayout;
