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
  ae1: '#5a5fd7',
  ae2: '#10b981',
};

const ENGINE_LABELS: Record<string, string> = {
  ae1: 'Genset 1',
  ae2: 'Genset 2',
};

interface Props {
  data: EngineConsumptionPoint[];
  engineCount: number;
  className?: string;
}

export default function EngineConsumptionChart({
  data,
  engineCount,
  className,
}: Props) {
  const isMediumScreen = useMedia('(max-width: 1200px)', false);
  const engineKeys = ['ae1', 'ae2'].slice(0, engineCount);

  return (
    <WidgetCard title="Genset Consumptions (L/H)" className={className}>
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
