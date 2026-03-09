"use client"

import WidgetCard from '@/components/cards/widget-card';
import SpeedMeter from '@/components/speed-meter/speed-meter';
import {
  computeGKWH,
  computeKW,
  FUEL_GAUGE_MAX,
  RPM_GAUGE_MAX,
  vesselEngineData,
  type EngineMonitorData,
} from '@/data/nura/engine-data';
import { getChartData } from '@/data/nura/operation-monitor-charts-data';
import { selectedShipAtom } from '@/store/condition-monitoring-atoms';
import { useAtomValue } from 'jotai';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { Box } from 'rizzui/box';
import ConsumptionVsSpeedChart from './consumption-vs-speed-chart';
import EngineConsumptionChart from './engine-consumption-chart';

const RealTimeDataMap = dynamic(
  () => import('@/components/real-time-data/real-time-data-map'),
  { ssr: false }
);

// ─── Flow-meter row component ────────────────────────────────────────────────

function FlowMeterRow({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <div className="flex items-baseline gap-1.5">
        <span className="text-lg font-bold text-foreground tracking-tight">{value.toFixed(2)}</span>
        <span className="text-xs font-medium text-muted-foreground w-8 text-right">{unit}</span>
      </div>
    </div>
  );
}

// ─── Stat badge component ────────────────────────────────────────────────────

function StatBadge({ label, value, unit }: { label: string; value: string; unit: React.ReactNode }) {
  return (
    <div className="flex flex-col items-start">
      <span className="text-xs font-semibold mb-1">{label}</span>
      <div className="flex items-center gap-1">
        <span className="inline-block rounded bg-primary/10 px-3 py-0.5 text-sm font-semibold text-primary font-mono">
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
      className='lg:p-2'
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
          gaugeHeight={220}
        />
        <div className="flex items-center justify-center gap-6 -mt-20">
          <div className="text-center">
            <span className="text-xs text-muted-foreground">{engine.label}</span>
          </div>
        </div>
        <div className="flex items-center justify-center gap-4 mt-1">
          <span className="text-xs text-muted-foreground">RPM</span>
        </div>
        <div className="flex items-center justify-center mt-1">
          <span className="inline-block rounded bg-primary/10 px-3 py-0.5 text-sm font-semibold text-primary font-mono">
            {kw}
          </span>
          <span className="text-xs text-muted-foreground ml-2">kw</span>
        </div>
      </div>

      {/* Fuel Gauge */}
      <div className="mt-4">
        <SpeedMeter
          bare
          title={engine.label}
          value={gkwh}
          max={FUEL_GAUGE_MAX}
          centerLabel={`${gkwh}`}
          fillColor="#00858D"
          gaugeHeight={220}
        />
        <div className="flex items-center justify-center gap-6 -mt-20">
          <div className="text-center">
            <span className="text-xs text-muted-foreground">{engine.label}</span>
          </div>
        </div>
        <div className="flex items-center justify-center gap-4 mt-1">
          <span className="text-xs text-muted-foreground">g/Kwh</span>
        </div>
        <div className="flex items-center justify-center mt-1">
          <span className="inline-block rounded bg-primary/10 px-3 py-0.5 text-sm font-semibold text-primary font-mono">
            {engine.gauge.fuel_cons.toFixed(1)}
          </span>
          <span className="text-xs text-muted-foreground ml-2">L/H</span>
        </div>
      </div>

      {/* Totals */}
      <div className="flex justify-center gap-6 mt-6">
        <StatBadge
          label="Total Fuel"
          value={engine.totals.total_fuel.toFixed(2)}
          unit={<>M<sup>3</sup></>}
        />
        <StatBadge
          label="Run Hrs"
          value={engine.totals.running_hours.toFixed(2)}
          unit="H"
        />
      </div>

      {/* FM data */}
      <div className="mt-3 rounded-lg shadow-2xl bg-transparent p-3 space-y-1.5 max-w-[300px] mx-auto">
        <FlowMeterRow label="FM in" value={engine.flowMeter.fm_in} unit="kg/h" />
        <FlowMeterRow label="FM Cons" value={engine.flowMeter.fm_cons} unit="kg/h" />
        {/* <FlowMeterRow label="FM out" value={engine.flowMeter.fm_out} unit="kg/h" /> */}
        <FlowMeterRow label="FM out" value={engine.flowMeter.fm_in - engine.flowMeter.fm_cons} unit="kg/h" />
      </div>
    </WidgetCard>
  );
}

// ─── Real Time Data Layout ──────────────────────────────────────────────────

const RealTimeDataLayout = () => {
  const vessel = useAtomValue(selectedShipAtom);

  // Engine data for the selected vessel
  const engines = vesselEngineData[vessel.id] ?? [];

  // Chart data for the selected vessel (memoized to avoid re-generating on every render)
  const chartData = useMemo(() => getChartData(vessel.id), [vessel.id]);

  // Grid columns based on engine count
  const gridCols = engines.length > 3
    ? 'lg:grid-cols-4'
    : engines.length === 3
      ? 'lg:grid-cols-3'
      : 'lg:grid-cols-2';

  return (
    <>
      <Box className="@container/pd">
        {/* Row 1 — Engine gauges + Map */}
        <Box className="grid grid-cols-10 gap-4 @container/pd lg:gap-8">
          {/* Left column — 70% */}
          <Box className="col-span-10 lg:col-span-7">
            <Box className={`grid grid-cols-1 gap-4 ${gridCols}`}>
              {engines.map((engine) => (
                <Box key={engine.id} className="col-span-3 sm:col-span-1 shadow-lg">
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

        {/* Row 2 — Main Engines Consumption */}
        <Box className="mt-6 grid grid-cols-1 gap-6 @container/pd lg:mt-8 3xl:gap-8">
          <EngineConsumptionChart
            data={chartData.consumption}
            engineCount={engines.length}
          />
        </Box>

        {/* Row 3 — Consumption vs Speed */}
        <Box className="mt-6 grid grid-cols-1 gap-6 @container/pd lg:mt-8 3xl:gap-8">
          <ConsumptionVsSpeedChart
            data={chartData.consumptionVsSpeed}
            engineCount={engines.length}
          />
        </Box>
      </Box>
    </>
  );
};

export default RealTimeDataLayout;
