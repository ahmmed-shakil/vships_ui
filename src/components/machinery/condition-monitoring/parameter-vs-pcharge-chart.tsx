'use client';

import WidgetCard from '@/components/cards/widget-card';
import { CustomTooltip } from '@/components/charts/custom-tooltip';
import {
    pchargeScatterDots,
    pchargeScatterLine,
} from '@/data/nura/condition-monitoring-chart-data';
import {
    CartesianGrid,
    ResponsiveContainer,
    Scatter,
    ScatterChart,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

/**
 * Parameter vs Pcharge - iso
 *
 * Scatter chart showing Charge Air Pressure (x) vs Exh Gas Temp Manifold (y).
 * Two series with inline legend in the widget header.
 */
export default function ParameterVsPchargeChart({ className }: { className?: string }) {
    return (
        <WidgetCard
            title="Parameter vs Pcharge - iso"
            className={className}
            action={
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <span className="inline-block h-0.5 w-4" style={{ backgroundColor: '#22C55E' }} />
                        Item
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: '#A855F7' }} />
                        Item
                    </span>
                </div>
            }
        >
            <div className="mt-4 aspect-[1060/800] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 5, right: 10, left: 5, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            type="number"
                            dataKey="x"
                            name="Charge Air Pressure"
                            label={{
                                value: 'Charge Air Pressure',
                                position: 'insideBottom',
                                offset: -2,
                                style: { fontSize: 11, fill: '#9FA6B5' },
                            }}
                            tick={{ fontSize: 10, fill: '#9FA6B5' }}
                            domain={[0, 5]}
                        />
                        <YAxis
                            type="number"
                            dataKey="y"
                            name="Exh Gas Temp Manifold"
                            label={{
                                value: 'Exh Gas Temp Manifold',
                                angle: -90,
                                position: 'insideLeft',
                                offset: 20,
                                style: { fontSize: 10, fill: '#9FA6B5' },
                            }}
                            tick={{ fontSize: 10, fill: '#9FA6B5' }}
                            domain={[0, 450]}
                            tickCount={10}
                        />
                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ strokeDasharray: '3 3' }}
                        />
                        <Scatter
                            name="Line"
                            data={pchargeScatterLine}
                            fill="#22C55E"
                            line={{ stroke: '#22C55E', strokeWidth: 2 }}
                            shape="circle"
                            legendType="line"
                        />
                        <Scatter
                            name="Dots"
                            data={pchargeScatterDots}
                            fill="#A855F7"
                            shape="circle"
                        />
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
        </WidgetCard>
    );
}
