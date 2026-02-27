'use client';

import WidgetCard from '@/components/cards/widget-card';
import { CustomTooltip } from '@/components/charts/custom-tooltip';
import { coolantPressureData } from '@/data/nura/condition-monitoring-chart-data';
import {
    CartesianGrid,
    Line,
    LineChart,
    ReferenceArea,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

/** Custom X-axis tick — date on top, time on bottom */
function DateTimeTick({ x, y, payload }: any) {
    const parts = (payload.value as string).split('\n');
    return (
        <g transform={`translate(${x},${y})`}>
            <text x={0} y={0} dy={10} textAnchor="middle" fontSize={8} fill="#9FA6B5">
                {parts[0]}
            </text>
            <text x={0} y={0} dy={20} textAnchor="middle" fontSize={8} fill="#9FA6B5">
                {parts[1] ?? ''}
            </text>
        </g>
    );
}

/**
 * Coolant Pressure - ME Port
 *
 * Line chart with 3 lines:
 * - Within Limit (solid blue) — actual temperature
 * - Upper Limit (dashed green) — flat reference line
 * - Out of Bound (dashed orange) — flat reference line at bottom
 * Orange band above the upper limit.
 */
export default function CoolantPressureChart({ className }: { className?: string }) {
    return (
        <WidgetCard
            title="Coolant Pressure - ME Port"
            className={className}
            action={
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <span className="inline-block h-0.5 w-4" style={{ backgroundColor: '#3B82F6' }} />
                        Within Limit
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="inline-block h-0.5 w-4 border-t border-dashed" style={{ borderColor: '#22C55E' }} />
                        Upper Limit
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="inline-block h-0.5 w-4 border-t border-dashed" style={{ borderColor: '#F97316' }} />
                        Out of Bound
                    </span>
                </div>
            }
        >
            <div className="mt-4 aspect-[1060/700] lg:aspect-[1060/500] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={coolantPressureData}
                        margin={{ top: 5, right: 20, left: -10, bottom: 20 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />

                        {/* Orange band above upper limit */}
                        <ReferenceArea
                            y1={5.0}
                            y2={6}
                            fill="#F97316"
                            fillOpacity={0.15}
                            ifOverflow="hidden"
                        />

                        <XAxis
                            dataKey="date"
                            tick={<DateTimeTick />}
                            interval={0}
                            height={40}
                        />
                        <YAxis
                            label={{
                                value: 'Temperature, °C',
                                angle: -90,
                                position: 'insideLeft',
                                offset: 20,
                                style: { fontSize: 11, fill: '#9FA6B5' },
                            }}
                            tick={{ fontSize: 11, fill: '#9FA6B5' }}
                            domain={[0, 6]}
                            tickCount={13}
                        />
                        <Tooltip content={<CustomTooltip />} />

                        {/* Actual temperature */}
                        <Line
                            type="stepAfter"
                            dataKey="temperature"
                            name="Within Limit"
                            stroke="#3B82F6"
                            strokeWidth={2}
                            dot={false}
                        />

                        {/* Upper limit reference */}
                        <Line
                            type="monotone"
                            dataKey="upperLimit"
                            name="Upper Limit"
                            stroke="#22C55E"
                            strokeWidth={1.5}
                            strokeDasharray="6 4"
                            dot={false}
                        />

                        {/* Out of bound reference */}
                        <Line
                            type="monotone"
                            dataKey="outOfBound"
                            name="Out of Bound"
                            stroke="#F97316"
                            strokeWidth={1.5}
                            strokeDasharray="6 4"
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </WidgetCard>
    );
}
