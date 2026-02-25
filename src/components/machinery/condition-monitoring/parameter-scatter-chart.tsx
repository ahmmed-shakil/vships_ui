'use client';

import WidgetCard from '@/components/cards/widget-card';
import { CustomTooltip } from '@/components/charts/custom-tooltip';
import {
    scatterDataGreen,
    scatterDataPurple,
    scatterParamOptions,
} from '@/data/nura/condition-monitoring-chart-data';
import { useState } from 'react';
import {
    CartesianGrid,
    ResponsiveContainer,
    Scatter,
    ScatterChart,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { Select } from 'rizzui/select';

/**
 * Scatter Op 1 vs Op 2 — scatter chart with parameter dropdown.
 *
 * Shows two scatter series (green + purple) with a dropdown to select
 * which parameter pair is displayed (dummy for now).
 * Legend items are placed in the widget header action area.
 */
export default function ParameterScatterChart({ className }: { className?: string }) {
    const [selectedParam, setSelectedParam] = useState(scatterParamOptions[0]);

    return (
        <WidgetCard
            title="Scatter Op 1 vs Op 2"
            className={className}
            action={
                <div className="flex items-center gap-3">
                    <Select
                        options={scatterParamOptions}
                        value={selectedParam}
                        onChange={setSelectedParam}
                        className="w-28"
                        selectClassName="h-8 text-xs"
                        dropdownClassName="text-sm"
                    />
                    {/* Inline legend */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <span className="inline-block h-2 w-4 rounded-sm" style={{ backgroundColor: '#22C55E' }} />
                            Series 1
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="inline-block h-2 w-2 rotate-45 rounded-sm" style={{ backgroundColor: '#A855F7' }} />
                            Series 2
                        </span>
                    </div>
                </div>
            }
        >
            <div className="mt-4 aspect-[1060/700] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            type="number"
                            dataKey="x"
                            name="Fuel Pump Index"
                            label={{
                                value: 'Fuel Pump Index',
                                position: 'insideBottom',
                                offset: -2,
                                style: { fontSize: 12, fill: '#9FA6B5' },
                            }}
                            tick={{ fontSize: 11 }}
                            domain={[0, 100]}
                        />
                        <YAxis
                            type="number"
                            dataKey="y"
                            name="Charge Air Pressure"
                            label={{
                                value: 'Charge Air Pressure',
                                angle: -90,
                                position: 'insideLeft',
                                offset: 20,
                                style: { fontSize: 11, fill: '#9FA6B5' },
                            }}
                            tick={{ fontSize: 11 }}
                            domain={[0, 5]}
                            tickCount={11}
                        />
                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ strokeDasharray: '3 3' }}
                        />
                        <Scatter
                            name="Series 1"
                            data={scatterDataGreen}
                            fill="#22C55E"
                            shape="circle"
                        />
                        <Scatter
                            name="Series 2"
                            data={scatterDataPurple}
                            fill="#A855F7"
                            shape="diamond"
                        />
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
        </WidgetCard>
    );
}
