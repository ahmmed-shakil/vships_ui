'use client';

import WidgetCard from '@/components/cards/widget-card';
import { CustomTooltip } from '@/components/charts/custom-tooltip';
import { trendlineData, trendlineSeries } from '@/data/nura/condition-monitoring-chart-data';
import { useCallback, useState } from 'react';
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

/**
 * Delta Deviation Trendline — multi-series line chart with interactive legend.
 *
 * 7 parameters matching the reference screenshot. Clicking a legend item
 * toggles that series' visibility.
 */
export default function DeltaDeviationTrendline({ className }: { className?: string }) {
    // Track which series are hidden (all visible by default)
    const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());

    const handleLegendClick = useCallback((dataKey: string) => {
        setHiddenSeries((prev) => {
            const next = new Set(prev);
            if (next.has(dataKey)) {
                next.delete(dataKey);
            } else {
                next.add(dataKey);
            }
            return next;
        });
    }, []);

    return (
        <WidgetCard title="Delta Deviation Trendline" className={className}>
            <div className="mt-4 aspect-[1060/500] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={trendlineData}
                        margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 10 }}
                            interval={0}
                        />
                        <YAxis
                            label={{
                                value: 'Parameter',
                                angle: -90,
                                position: 'insideLeft',
                                offset: 20,
                                style: { fontSize: 12, fill: '#6B7280' },
                            }}
                            tick={{ fontSize: 11 }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            onClick={(e: any) => handleLegendClick(e.dataKey)}
                            wrapperStyle={{ cursor: 'pointer', fontSize: 11 }}
                        />

                        {trendlineSeries.map((s) => (
                            <Line
                                key={s.key}
                                type="monotone"
                                dataKey={s.key}
                                name={s.label}
                                stroke={s.color}
                                strokeWidth={2}
                                strokeDasharray={s.dash || undefined}
                                dot={false}
                                hide={hiddenSeries.has(s.key)}
                                activeDot={{ r: 4 }}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </WidgetCard>
    );
}
