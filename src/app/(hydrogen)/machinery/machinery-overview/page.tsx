'use client';

import PageHeader from '@/app/shared/page-header';
import MachineryCard from '@/components/cards/machinery-card';
import { MachineryCardProps } from '@/types';
import { Box } from 'rizzui/box';
import { Select } from 'rizzui';
import { useState } from 'react';

const pageHeader = {
  title: 'Machinery Overview',
  breadcrumb: [
    {
      href: '/',
      name: 'Home',
    },
    {
      name: 'Machinery',
    },
    {
      name: 'Machinery Overview',
    },
  ],
};

const vesselOptions = [
  { label: 'MV Ocean Star', value: 'mv-ocean-star' },
  { label: 'MV Pacific Voyager', value: 'mv-pacific-voyager' },
  { label: 'MV Atlantic Pioneer', value: 'mv-atlantic-pioneer' },
  { label: 'MV Nordic Explorer', value: 'mv-nordic-explorer' },
  { label: 'MV Southern Cross', value: 'mv-southern-cross' },
];

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
  const [selectedVessel, setSelectedVessel] = useState(vesselOptions[0]);

  return (
    <div className=' pt-5'>
      <PageHeader
        title={pageHeader.title}
        breadcrumb={pageHeader.breadcrumb}
        isFixed
        rightContent={
          <Select
            size="sm"
            options={vesselOptions}
            value={selectedVessel}
            onChange={setSelectedVessel}
            placeholder="Select Vessel"
            className="w-52"
          />
        }
      />
      <Box className="@container/pd">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {machineryData.map((item) => (
            <MachineryCard key={item.id} data={item} />
          ))}
        </div>
      </Box>
    </div>
  );
}
