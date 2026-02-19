"use client"

import WidgetCard from '@/components/cards/widget-card';
import SpeedMeter from '@/components/speed-meter/speed-meter';
import {
  computeGKWH,
  computeKW,
  engineMonitorData,
  FUEL_GAUGE_MAX,
  RPM_GAUGE_MAX,
  vesselPosition,
  type EngineMonitorData,
} from '@/data/nura/engine-data';
import { shipData } from '@/data/nura/ships';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { Box } from 'rizzui/box';
import { Select } from 'rizzui/select';
import CustomizedMixChart from '../../app/shared/chart-widgets/customized-mix-chart';
import MixBarChart from '../../app/shared/chart-widgets/mix-bar-chart';

const OperationMonitorMap = dynamic(
  () => import('@/components/operation-monitor/operation-monitor-map'),
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
            <span className="text-xs text-muted-foreground">M/E PS</span>
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
            <span className="text-xs text-muted-foreground">M/E PS</span>
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
        <FlowMeterRow label="FM out" value={engine.flowMeter.fm_out} unit="kg/h" />
      </div>
    </WidgetCard>
  );
}

// ─── Operation Monitor Layout ────────────────────────────────────────────────

const OperationMonitorLayout = () => {
  const [vessel, setVessel] = useState(shipData[0])
  return (
    <>
      <div className="mb-4 w-64 flex items-center gap-3 @lg:mb-0 @lg:w-fit">
        <Select
          options={shipData}
          value={vessel}
          onChange={(value: typeof shipData[0]) => setVessel(value)}
          placeholder="Select Vessel"
          className="w-full @lg:w-64"
          dropdownClassName="!z-10"
        />
      </div>
      <Box className="@container/pd">
        {/* Row 1 — Engine gauges + Map */}
        <Box className="grid grid-cols-10 gap-4 @container/pd lg:gap-8">
          {/* Left column — 70% */}
          <Box className="col-span-10 lg:col-span-7">
            <Box className={`grid grid-cols-1 gap-4 ${engineMonitorData.length > 3 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
              {engineMonitorData.map((engine) => (
                <Box key={engine.id} className="col-span-3 sm:col-span-1 shadow-lg">
                  <EngineMonitorCard engine={engine} />
                </Box>
              ))}
            </Box>
          </Box>

          {/* Right column — 30% */}
          <Box className="col-span-10 lg:col-span-3">
            <OperationMonitorMap
              name={vesselPosition.name}
              lat={vesselPosition.lat}
              long={vesselPosition.long}
              direction={vesselPosition.direction}
              timestamp={vesselPosition.timestamp}
              minHeight={600}
            />
          </Box>
        </Box>
        {/* Row 2 */}
        <Box className="mt-6 grid grid-cols-1 gap-6 @container/pd lg:mt-8 3xl:gap-8">
          <MixBarChart />
        </Box>
        {/* Row 3 */}
        <Box className="mt-6 grid grid-cols-1 gap-6 @container/pd lg:mt-8 3xl:gap-8">
          <CustomizedMixChart />
        </Box>
      </Box>
    </>
  );
};

export default OperationMonitorLayout;
