'use client';

import AlarmTable from '@/components/alarm-monitor/alarm-table';
import HealthScoreHeader from '@/components/cards/health-score-header';
import MachineryCardBody from '@/components/cards/machinery-card-body';
import PerfomaxCard from '@/components/cards/perfomax-card';
import StatusGauge from '@/components/machinery-overview/status-gauge';
import { vesselAlarmData } from '@/data/nura/alarm-data';
import { vesselGensetData } from '@/data/nura/engine-data';
import { Ship, shipData } from '@/data/nura/ships';
import { MachineryCardProps } from '@/types';
import { getHealthColor } from '@/utils/get-health-color';
import { useMemo, useState } from 'react';
import { Box } from 'rizzui/box';

const defaultMetrics = [
  { label: 'RPM', value: '74', unit: 'mm/s', showSparkline: true },
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
    status: 'running',
    alarms: { info: 4, notice: 0, warning: 1, critical: 1 },
    metrics: defaultMetrics,
  },
  {
    id: 2,
    title: 'Engine 2',
    healthScore: 98,
    status: 'running',
    alarms: { info: 4, notice: 1, warning: 2, critical: 0 },
    metrics: defaultMetrics,
  },
  {
    id: 3,
    title: 'Engine 3',
    healthScore: 55,
    status: 'standby',
    alarms: { info: 3, notice: 0, warning: 0, critical: 0 },
    metrics: defaultMetrics,
  },
  {
    id: 4,
    title: 'Winch',
    healthScore: 83,
    status: 'running',
    alarms: { info: 2, notice: 0, warning: 0, critical: 0 },
    metrics: defaultMetrics,
  },
  {
    id: 5,
    title: 'Gen Set 1',
    healthScore: 80,
    status: 'running',
    alarms: { info: 2, notice: 0, warning: 0, critical: 0 },
    metrics: defaultMetrics,
  },
  {
    id: 6,
    title: 'Gen Set 2',
    healthScore: 80,
    status: 'running',
    alarms: { info: 2, notice: 0, warning: 0, critical: 0 },
    metrics: defaultMetrics,
  },
  {
    id: 7,
    title: 'Gen Set 3',
    healthScore: 98,
    status: 'off',
    alarms: { info: 1, notice: 0, warning: 0, critical: 0 },
    metrics: defaultMetrics,
  },
  {
    id: 8,
    title: 'Crane',
    healthScore: 98,
    status: 'off',
    alarms: { info: 1, notice: 0, warning: 0, critical: 0 },
    metrics: defaultMetrics,
  },
];

export default function MachineryOverviewPage() {
  const [selectedShip, setSelectedShip] = useState<Ship>(shipData[0]);

  // Get alarm data for the selected vessel
  const alarms = useMemo(
    () => vesselAlarmData[selectedShip.id] ?? [],
    [selectedShip.id]
  );

  // Lookup engine data for the selected vessel
  const vesselId = selectedShip.id;
  const gensets = vesselGensetData[vesselId] ?? [];

  return (
    <>
      <Box className="@container/pd pt-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {machineryData.map((item) => (
            <PerfomaxCard
              key={item.id}
              title={item.title}
              accentColor={getHealthColor(item.healthScore)}
              headerRight={<StatusGauge status={item.status} />}
              action={<HealthScoreHeader score={item.healthScore} />}
            >
              <MachineryCardBody data={item} />
            </PerfomaxCard>
          ))}
        </div>
      </Box>
      <AlarmTable
        data={alarms}
        title={`Alarms — ${selectedShip.label}`}
        className='mt-10'
      />
    </>
  );
}
