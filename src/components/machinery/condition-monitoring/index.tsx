"use client"

import WidgetCard from "@/components/cards/widget-card";
import { selectedEngineAtom, selectedShipAtom } from "@/store/condition-monitoring-atoms";
import cn from "@/utils/class-names";
import { useAtomValue } from "jotai";
import Image from "next/image";

import HealthGauge from "@/components/machinery-overview/health-gauge";
import ConditionBasedAnalysisTable from "./condition-based-analysis-table";
import CoolantPressureChart from "./coolant-pressure-chart";
import DeltaDeviationTrendline from "./delta-deviation-trendline";
import HealthScoreCard from "./health-score-card";
import ParameterScatterChart from "./parameter-scatter-chart";
import ParameterVsPchargeChart from "./parameter-vs-pcharge-chart";

// ─── Reusable Dotted Row Component ───────────────────────────────────────────
function DottedRow({ label, value, className }: { label: string; value: React.ReactNode; className?: string }) {
    return (
        <div className={cn("flex items-baseline w-full py-1.5 text-sm", className)}>
            <span className="text-foreground font-medium whitespace-nowrap">{label}</span>
            {/* The flex-1 dashed border acts as the responsive separator */}
            <div className="flex-1 mx-3 border-b border-dashed border-muted relative -top-1 hidden sm:block"></div>
            <span className="text-foreground font-semibold whitespace-nowrap text-right">{value}</span>
        </div>
    );
}

export default function ConditionMonitoringLayout() {
    // Read global state from atoms (selectors are in the header)
    const selectedShip = useAtomValue(selectedShipAtom);
    const selectedEngine = useAtomValue(selectedEngineAtom);

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ─── Card 1: ME 2 Port ──────────────────────────────────────────────── */}
                <WidgetCard title="ME 2 Port" className="flex flex-col">
                    <div className="flex items-center flex-1">
                        <div className="w-2/5 px-2 shrink-0 flex items-center justify-center">
                            <Image
                                src="/engine/engine-1.png"
                                alt="Engine Make"
                                className="w-full object-contain drop-shadow-sm"
                                width={200}
                                height={200}
                            />
                        </div>
                        <div className="w-full flex flex-col justify-center">
                            <DottedRow label="Make" value="MaK 9M25C" className="my-2 text-lg" />
                            <DottedRow label="Built" value="2016" className="my-2 text-lg" />
                            <DottedRow label="Rating" value="2500 kW" className="my-2 text-lg" />
                        </div>
                    </div>
                </WidgetCard>

                {/* ─── Card 2: Basic Information ──────────────────────────────────────── */}
                <WidgetCard
                    title="Basic Information"
                    className="flex flex-col"
                    action={
                        <div className="flex flex-col items-end">
                            <div className="flex items-center gap-3 -mt-6">
                                <div className="text-[11px] font-semibold text-foreground uppercase tracking-widest leading-tight text-right">
                                    Health<br />Score
                                </div>
                                <HealthGauge value={80} />
                            </div>
                            <div className="text-[10px] text-foreground/50 mt-2 flex gap-2 mr-1">
                                <span>Low: param 1</span>
                                <span>param 2</span>
                                <span>param 3</span>
                            </div>
                        </div>
                    }
                >
                    <div className="flex flex-col flex-1 justify-center gap-1">
                        <DottedRow label="Last overhaul" value="12 Nov 2025" className="my-0 py-0" />
                        <DottedRow label="Total running hours" value="5403 hrs" className="my-0 py-0" />
                        <DottedRow label="Period running hours" value="251 hrs" className="my-0 py-0" />
                        <DottedRow label="Duration fuel consumption" value="-- kg" className="my-0 py-0" />
                        <DottedRow label="Duration average load" value="-- %" className="my-0 py-0" />
                    </div>
                </WidgetCard>

                {/* ─── Card 3: SFOC Scatter ───────────────────────────────────────────── */}
                <WidgetCard
                    title="SFOC Scatter"
                    description={
                        <span className="text-xs font-normal text-muted-foreground ml-2">
                            ( SFOC - Specific fuel oil consumption )
                        </span>
                    }
                    className="flex flex-col"
                    titleClassName="inline-flex items-center"
                >
                    <div className="flex flex-col items-center justify-center h-full min-h-[150px] mt-4 relative">
                        {/* Placeholder cross pattern matching screenshot */}
                        <div className="absolute inset-0 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900 overflow-hidden text-clip flex items-center justify-center">
                            <svg className="absolute inset-0 w-full h-full stroke-gray-300 dark:stroke-gray-700 stroke-1" preserveAspectRatio="none">
                                <line x1="0" y1="0" x2="100%" y2="100%" />
                                <line x1="100%" y1="0" x2="0" y2="100%" />
                            </svg>
                        </div>
                    </div>
                </WidgetCard>
            </div>

            {/* ─── Condition Based Analysis Table ─────────────────────────────────── */}
            <div className="mt-6">
                <ConditionBasedAnalysisTable />
            </div>

            {/* ─── Charts Row 1: Trendline + Scatter ─────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-6">
                <div className="lg:col-span-3">
                    <DeltaDeviationTrendline />
                </div>
                <div className="lg:col-span-2">
                    <ParameterScatterChart className="h-full" />
                </div>
            </div>
            {/* ─── Charts Row 2: Coolant + Health Score + Pcharge ─────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-11 gap-6 mt-6">
                <CoolantPressureChart className="col-span-5" />
                <HealthScoreCard className="col-span-3" />
                <ParameterVsPchargeChart className="col-span-3" />
            </div>
        </>
    );
}