'use client';

import PerfomaxCard from '@/components/cards/perfomax-card';
import HealthScoreHeader from '@/components/cards/health-score-header';
import MachineryCardBody from '@/components/cards/machinery-card-body';
import { getHealthColor } from '@/utils/get-health-color';
import { MachineryCardProps } from '@/types';
import { Box } from 'rizzui/box';

const defaultMetrics = [
  { label: 'RPM', value: '74', unit: 'mm/s' },
  { label: 'Exhaust Temp', value: '435', unit: '°C' },
  { label: 'Oil pressure', value: '--', unit: 'bar' },
  { label: 'Oil temp', value: '--', unit: 'bar' },
  { label: 'Coolant temp', value: '--', unit: 'bar' },
  { label: 'Consumption', value: 'xx', unit: 'l' },
];

const machineryData: MachineryCardProps[] = [
  {
    id: 1,
    title: 'Engine 1',
    healthScore: 80,
    alarms: { info: 4, notice: 0, warning: 1, critical: 1 },
    metrics: defaultMetrics,
  },
  {
    id: 2,
    title: 'Engine 2',
    healthScore: 98,
    alarms: { info: 4, notice: 1, warning: 2, critical: 0 },
    metrics: defaultMetrics,
  },
  {
    id: 3,
    title: 'Engine 3',
    healthScore: 55,
    alarms: { info: 3, notice: 0, warning: 0, critical: 0 },
    metrics: defaultMetrics,
  },
  {
    id: 4,
    title: 'Winch',
    healthScore: 83,
    alarms: { info: 2, notice: 0, warning: 0, critical: 0 },
    metrics: defaultMetrics,
  },
  {
    id: 5,
    title: 'Gen Set 1',
    healthScore: 80,
    alarms: { info: 2, notice: 0, warning: 0, critical: 0 },
    metrics: defaultMetrics,
  },
  {
    id: 6,
    title: 'Gen Set 2',
    healthScore: 80,
    alarms: { info: 2, notice: 0, warning: 0, critical: 0 },
    metrics: defaultMetrics,
  },
  {
    id: 7,
    title: 'Gen Set 3',
    healthScore: 98,
    alarms: { info: 1, notice: 0, warning: 0, critical: 0 },
    metrics: defaultMetrics,
  },
  {
    id: 8,
    title: 'Crane',
    healthScore: 98,
    alarms: { info: 1, notice: 0, warning: 0, critical: 0 },
    metrics: defaultMetrics,
  },
];

export default function MachineryOverviewPage() {
  return (
    <div className="pt-5">
      <Box className="@container/pd">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {machineryData.map((item) => (
            <PerfomaxCard
              key={item.id}
              title={item.title}
              // accentColor={getHealthColor(item.healthScore)}
              // action={<HealthScoreHeader score={item.healthScore} />}
            >
              <MachineryCardBody data={item} />
            </PerfomaxCard>
          ))}
        </div>
      </Box>
    </div>
  );
}
