'use client';

import HealthScoreHeader from '@/components/cards/health-score-header';
import PerfomaxCard from '@/components/cards/perfomax-card';
import {
  selectedEngineAtom,
  selectedShipAtom,
} from '@/store/condition-monitoring-atoms';
import cn from '@/utils/class-names';
import { useAtomValue } from 'jotai';
import Image from 'next/image';

import ConditionBasedAnalysisTable from './condition-based-analysis-table';
import CoolantPressureChart from './coolant-pressure-chart';
import DeltaDeviationTrendline from './delta-deviation-trendline';
import HealthScoreCard from './health-score-card';
import ParameterScatterChart from './parameter-scatter-chart';
import ParameterVsPchargeChart from './parameter-vs-pcharge-chart';

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

export default function ConditionMonitoringLayout() {
  // Read global state from atoms (selectors are in the header)
  const selectedShip = useAtomValue(selectedShipAtom);
  const selectedEngine = useAtomValue(selectedEngineAtom);

  return (
    <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ─── Card 1: ME 2 Port ──────────────────────────────────────────────── */}
        <PerfomaxCard
          title="ME 2 Port"
          className="flex flex-col"
          bodyClassName="p-5 border-t border-muted/50"
          action={
            <div className="flex flex-col items-end gap-2">
              <div className="invisible">
                <HealthScoreHeader score={80} />
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
              <DottedRow label="Make" value="MaK 9M25C" className="my-1" />
              <DottedRow label="Built" value="2016" className="my-1" />
              <DottedRow label="Rating" value="2500 kW" className="my-1" />
            </div>
          </div>
        </PerfomaxCard>

        {/* ─── Card 2: Basic Information ──────────────────────────────────────── */}
        <PerfomaxCard
          title="Basic Information"
          className="flex flex-col"
          bodyClassName="px-5 border-t-2 py-2"
          headerClassName="items-start"
          action={
            <div className="flex flex-col items-end gap-2">
              <HealthScoreHeader score={80} />
            </div>
          }
          headerFooter={
            <div className="flex flex-wrap gap-3 px-5 pb-1 text-sm font-medium">
              <span className="text-red-500">Low: Exhaust Temp</span>
              <span className="text-amber-500">Lube Oil Press</span>
              <span className="text-amber-500">Coolant Temp</span>
            </div>
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
        <PerfomaxCard
          title="SFOC Scatter"
          bodyClassName="px-2 border-t border-muted/50"
          className="flex flex-col"
          action={
            <div className="flex flex-col items-end gap-2">
              <div className="invisible">
                <HealthScoreHeader score={80} />
              </div>
            </div>
          }
          headerFooter={
            <div className="px-5 pb-1 text-sm font-medium">
              <span className="invisible">Placeholder</span>
            </div>
          }
        >
          <div className="relative mt-2 flex h-full min-h-[150px] flex-col items-center justify-center">
            {/* Placeholder cross pattern matching screenshot */}
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden text-clip border border-blue-100 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-900/10">
              <svg
                className="absolute inset-0 h-full w-full stroke-gray-300 stroke-1 dark:stroke-gray-700"
                preserveAspectRatio="none"
              >
                <line x1="0" y1="0" x2="100%" y2="100%" />
                <line x1="100%" y1="0" x2="0" y2="100%" />
              </svg>
            </div>
          </div>
        </PerfomaxCard>
      </div>

      {/* ─── Condition Based Analysis Table ─────────────────────────────────── */}

      {/* ─── Charts Row 1: Trendline + Scatter ─────────────────────────────── */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <DeltaDeviationTrendline className="h-full" />
        </div>
        <div className="lg:col-span-2">
          <ParameterScatterChart className="h-full" />
        </div>
      </div>

      <div className="mt-6">
        <ConditionBasedAnalysisTable />
      </div>

      {/* ─── Charts Row 2: Coolant + Health Score + Pcharge ─────────────────── */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-11">
        <CoolantPressureChart className="col-span-5" />
        <HealthScoreCard className="col-span-3" />
        <ParameterVsPchargeChart className="col-span-3" />
      </div>
    </>
  );
}
