'use client';

import HealthScoreHeader from '@/components/cards/health-score-header';
import PerfomaxCard from '@/components/cards/perfomax-card';
import {
  useDeltaDeviation,
  useFuelRate,
  useParameterScatter,
  useSensorDataApi,
  useSfocScatter,
  useSpareParts,
} from '@/hooks/use-machinery-data';
import {
  selectedEngineAtom,
  selectedShipAtom,
} from '@/store/condition-monitoring-atoms';
import cn from '@/utils/class-names';
import { useAtomValue } from 'jotai';
import Image from 'next/image';

import {
  computeParameterStats,
  extractParameterValues,
} from '@/utils/sensor-stats';
import ConditionBasedAnalysisTable from './condition-based-analysis-table';
import CoolantPressureChart from './coolant-pressure-chart';
import DeltaDeviationTrendline from './delta-deviation-trendline';
import HealthScoreCard from './health-score-card';
import ParameterScatterChart from './parameter-scatter-chart';
import ParameterVsRpmChart from './parameter-vs-rpm-chart';
import SensorLineChart, { type SensorSeries } from './sensor-line-chart';
import SfocScatterCard from './sfoc-scatter-card';

// TODO: Restore health scores from useHealthScores() / API; pass real values to
// HealthScoreHeader and HealthScoreCard (entry + isLoading).

// ─── Reusable Dotted Row Component ───────────────────────────────────────────
function DottedRow({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex w-full items-baseline py-1.5 text-sm', className)}>
      <span className="whitespace-nowrap font-medium text-foreground">
        {label}
      </span>
      {/* The flex-1 dashed border acts as the responsive separator */}
      <div className="relative -top-1 mx-3 hidden flex-1 border-b border-dashed border-muted sm:block"></div>
      <span className="whitespace-nowrap text-right font-semibold text-foreground">
        {value}
      </span>
    </div>
  );
}

// ─── 8 Sensor chart row definitions ──────────────────────────────────────────
const SENSOR_CHART_ROWS: {
  title: string;
  yAxisLabel: string;
  /** Primary key used for Stats calculations (avg / mov-avg / dev) */
  primaryDataKey: string;
  /** Used when primaryDataKey yields all-null values (e.g. eg_temp_mean → eg_temp_1) */
  fallbackDataKey?: string;
  series: SensorSeries[];
  thresholds?: { min?: number; max?: number };
}[] = [
  {
    title: 'Turbocharger RPM',
    yAxisLabel: 'TC RPM',
    primaryDataKey: 'tc_rpm',
    series: [{ dataKey: 'tc_rpm', label: 'TC RPM' }],
    thresholds: { min: 25, max: 30 },
  },
  {
    title: 'Engine RPM',
    yAxisLabel: 'RPM',
    primaryDataKey: 'rpm',
    series: [{ dataKey: 'rpm', label: 'RPM' }],
    thresholds: { min: 100, max: 700 },
  },
  {
    title: 'Fuel Rack Position',
    yAxisLabel: 'FPI',
    primaryDataKey: 'fpi',
    series: [{ dataKey: 'fpi', label: 'FPI' }],
    thresholds: { min: 5, max: 40 },
  },
  {
    title: 'Exhaust Gas Temperatures (Cylinders)',
    yAxisLabel: 'EG Temp (°C)',
    primaryDataKey: 'eg_temp_mean',
    fallbackDataKey: 'eg_temp_1',
    series: [
      { dataKey: 'eg_temp_1', label: 'Cyl 1', color: '#3B82F6' },
      { dataKey: 'eg_temp_2', label: 'Cyl 2', color: '#EF4444' },
      { dataKey: 'eg_temp_3', label: 'Cyl 3', color: '#22C55E' },
      { dataKey: 'eg_temp_4', label: 'Cyl 4', color: '#F59E0B' },
      { dataKey: 'eg_temp_5', label: 'Cyl 5', color: '#A855F7' },
      { dataKey: 'eg_temp_6', label: 'Cyl 6', color: '#EC4899' },
      { dataKey: 'eg_temp_7', label: 'Cyl 7', color: '#06B6D4' },
      { dataKey: 'eg_temp_8', label: 'Cyl 8', color: '#F97316' },
      { dataKey: 'eg_temp_mean', label: 'Mean', color: '#FFFFFF' },
    ],
    thresholds: { min: 100, max: 350 },
  },
  {
    title: 'Exhaust Gas Temp (Turbo Out / Manifold)',
    yAxisLabel: 'Temp (°C)',
    primaryDataKey: 'eg_temp_out_turbo',
    series: [
      {
        dataKey: 'eg_temp_out_turbo',
        label: 'EG Temp Out Turbo',
        color: '#A855F7',
      },
      { dataKey: 'exh_gas_temp', label: 'Exh Gas Temp', color: '#EC4899' },
    ],
    thresholds: { min: 100, max: 400 },
  },
  {
    title: 'Charge Air Pressure',
    yAxisLabel: 'Pressure (bar)',
    primaryDataKey: 'chargeair_press',
    series: [{ dataKey: 'chargeair_press', label: 'Charge Air Press' }],
    thresholds: { min: 0, max: 15 },
  },
  {
    title: 'HT Cooling Water Temperature',
    yAxisLabel: 'Temp (°C)',
    primaryDataKey: 'ht_cw_temp',
    series: [
      { dataKey: 'ht_cw_temp', label: 'HT CW Temp', color: '#06B6D4' },
      {
        dataKey: 'ht_cw_inlet_temp',
        label: 'HT CW Inlet Temp',
        color: '#F59E0B',
      },
    ],
    thresholds: { min: 1000, max: 2800 },
  },
  {
    title: 'Lube Oil Temperature',
    yAxisLabel: 'Temp (°C)',
    primaryDataKey: 'lo_temp',
    series: [{ dataKey: 'lo_temp', label: 'LO Temp' }],
    thresholds: { min: 40, max: 70 },
  },
];

export default function ConditionMonitoringLayout() {
  // Read global state from atoms (selectors are in the header)
  const selectedShip = useAtomValue(selectedShipAtom);
  const selectedEngine = useAtomValue(selectedEngineAtom);
  const { data: sensorData, isLoading } = useSensorDataApi();
  const { response: deltaResponse, isLoading: deltaLoading } =
    useDeltaDeviation();
  const { response: scatterResponse, isLoading: scatterLoading } =
    useParameterScatter();
  const { response: sfocResponse, isLoading: sfocLoading } = useSfocScatter();
  const { response: fuelResponse, isLoading: fuelLoading } = useFuelRate();
  const { parts: spareParts, isLoading: partsLoading } = useSpareParts();

  if (!selectedShip) {
    return (
      <div className="flex h-96 items-center justify-center">
        <span className="text-muted-foreground">Loading vessel data…</span>
      </div>
    );
  }

  const engineSpecs = selectedEngine.value.startsWith('ae')
    ? { make: 'CAT 3408', built: '2005', rating: '--' }
    : { make: 'MAK 8M25C', built: '2005', rating: '2550 kW' };

  return (
    <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ─── Card 1: Selected Engine ─────────────────────────────────────────── */}
        <PerfomaxCard
          title={selectedEngine.label}
          className="flex flex-col"
          bodyClassName="px-5 border-t border-muted/50 py-2"
          headerClassName="items-start"
          action={
            <div className="flex flex-col items-end gap-2">
              <div className="invisible">
                <HealthScoreHeader score={null} />
              </div>
            </div>
          }
          headerFooter={
            <div className="px-5 pb-1 text-sm font-medium">
              <span className="invisible">Placeholder</span>
            </div>
          }
        >
          <div className="flex flex-1 items-center">
            <div className="flex w-2/6 shrink-0 items-center justify-center px-2">
              <Image
                src="/engine/engine-1.png"
                alt="Engine Make"
                className="w-full object-contain drop-shadow-sm"
                width={200}
                height={200}
              />
            </div>
            <div className="flex w-full flex-col justify-center">
              <DottedRow
                label="Make"
                value={engineSpecs.make}
                className="my-1"
              />
              <DottedRow
                label="Built"
                value={engineSpecs.built}
                className="my-1"
              />
              <DottedRow
                label="Rating"
                value={engineSpecs.rating}
                className="my-1"
              />
            </div>
          </div>
        </PerfomaxCard>

        {/* ─── Card 2: Basic Information ──────────────────────────────────────── */}
        <PerfomaxCard
          title="Basic Information"
          className="flex flex-col"
          bodyClassName="px-5 border-t border-muted/50 py-2"
          headerClassName="items-start"
          action={
            <div className="flex flex-col items-end gap-2">
              <HealthScoreHeader score={null} />
            </div>
          }
          headerFooter={
            // <div className="relative overflow-hidden px-5 pb-1">
            //   <div className="animate-marquee-scroll text-sm font-medium">
            //     <span className="mr-1 text-amber-500 underline decoration-amber-500">
            //       Check
            //     </span>
            //     <span className="text-foreground">Exh Gas Manifold Temp</span>
            //     <span className="ml-1 text-amber-500">@ 68 %</span>
            //     <span className="text-foreground">, Lube Oil Press </span>
            //     <span className="text-amber-500">@ 65%</span>
            //     <span className="text-foreground">, Coolant Temp </span>
            //     <span className="text-amber-500">@ 60%</span>
            //   </div>
            // </div>
            <div className="h-6" />
          }
        >
          <div className="flex flex-1 flex-col justify-center gap-1">
            <DottedRow
              label="Last overhaul"
              value="12 Nov 2025"
              className="py-1"
            />
            <DottedRow
              label="Total running hours"
              value="5403 hrs"
              className="py-1"
            />
            <DottedRow
              label="Period running hours"
              value="251 hrs"
              className="py-1"
            />
            <DottedRow
              label="Duration fuel consumption"
              value="-- kg"
              className="py-1"
            />
            <DottedRow
              label="Duration average load"
              value="-- %"
              className="py-1"
            />
          </div>
        </PerfomaxCard>

        {/* ─── Card 3: SFOC Scatter ───────────────────────────────────────────── */}
        <SfocScatterCard
          className="flex flex-col"
          response={sfocResponse}
          isLoading={sfocLoading}
        />
      </div>

      {/* ─── Charts Row 1: Trendline + Scatter ─────────────────────────────── */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <DeltaDeviationTrendline
            className="h-full"
            response={deltaResponse}
            isLoading={deltaLoading}
          />
        </div>
        <div className="lg:col-span-2">
          <ParameterScatterChart
            className="h-full"
            response={scatterResponse}
            isLoading={scatterLoading}
          />
        </div>
      </div>

      <div className="mt-6">
        <ConditionBasedAnalysisTable
          parts={spareParts}
          isLoading={partsLoading}
        />
      </div>

      {/* ─── Charts Row 2: Coolant + Health Score + Pcharge ─────────────────── */}
      {/* <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-11">
        <CoolantPressureChart className="col-span-5" />
        <HealthScoreCard className="col-span-3" />
        <ParameterVsPchargeChart className="col-span-3" />
      </div> */}

      {/* ─── Sensor Chart Rows (8 rows: chart + health score + pcharge) ──── */}
      {SENSOR_CHART_ROWS.map((row) => {
        const paramStats = computeParameterStats(
          sensorData,
          row.primaryDataKey,
          row.fallbackDataKey
        );
        const paramValues = extractParameterValues(
          sensorData,
          row.primaryDataKey,
          row.fallbackDataKey
        );
        return (
          <div
            key={row.title}
            className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-11"
          >
            <SensorLineChart
              title={row.title}
              yAxisLabel={row.yAxisLabel}
              series={row.series}
              data={sensorData}
              isLoading={isLoading}
              className="col-span-5"
              thresholds={row.thresholds}
            />
            <HealthScoreCard
              className="col-span-3"
              isLoading={isLoading}
              paramStats={paramStats}
              paramValues={paramValues}
            />
            <ParameterVsRpmChart
              className="col-span-3"
              parameterName={row.title}
              yAxisLabel={row.yAxisLabel}
              response={scatterResponse}
              isLoading={scatterLoading}
            />
          </div>
        );
      })}
    </>
  );
}
