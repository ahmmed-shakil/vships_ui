'use client';

import WidgetCard from '@/components/cards/widget-card';
import { CustomTooltip } from '@/components/charts/custom-tooltip';
import type { EngineConsumptionPoint } from '@/data/nura/operation-monitor-charts-data';
import { useMedia } from '@/hooks/use-media';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

const ENGINE_COLORS: Record<string, string> = {
    me1: '#5a5fd7',
    me2: '#10b981',
    me3: '#eab308',
    me4: '#f97316',
};

const ENGINE_LABELS: Record<string, string> = {
    me1: 'ME PORT',
    me2: 'ME STBD',
    me3: 'ME CENTER',
    me4: 'AUX 1',
};

interface Props {
    data: EngineConsumptionPoint[];
    engineCount: number;
    className?: string;
}

export default function EngineConsumptionChart({ data, engineCount, className }: Props) {
    const isMediumScreen = useMedia('(max-width: 1200px)', false);
    const engineKeys = ['me1', 'me2', 'me3', 'me4'].slice(0, engineCount);

    return (
        <WidgetCard title="Main Engines Consumption (L/H)" className={className}>
            <div className="mt-5 h-[40vh] min-h-[280px] w-full lg:mt-7">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        barSize={isMediumScreen ? 14 : 20}
                        margin={{ left: -10 }}
                        className="[&_.recharts-cartesian-grid-vertical]:opacity-0"
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis tickLine={false} dataKey="time" />
                        <YAxis tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        {engineKeys.map((key) => (
                            <Bar
                                key={key}
                                dataKey={key}
                                name={ENGINE_LABELS[key]}
                                fill={ENGINE_COLORS[key]}
                                radius={[4, 4, 0, 0]}
                            />
                        ))}
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </WidgetCard>
    );
}
