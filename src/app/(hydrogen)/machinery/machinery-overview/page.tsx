'use client';

import HealthScoreHeader from '@/components/cards/health-score-header';
import MachineryCardBody from '@/components/cards/machinery-card-body';
import PerfomaxCard from '@/components/cards/perfomax-card';
import StatusGauge from '@/components/machinery-overview/status-gauge';
import { routes } from '@/config/routes';
import { getActiveAlarmCounts } from '@/data/nura/alarm-data';
import { vesselGensetData } from '@/data/nura/engine-data';
import { engineData, Ship, shipData } from '@/data/nura/ships';
import {
  selectedEngineAtom,
  selectedShipAtom,
} from '@/store/condition-monitoring-atoms';
import { MachineryCardProps } from '@/types';
import { getHealthColor } from '@/utils/get-health-color';
import { useAtom, useSetAtom } from 'jotai';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { Box } from 'rizzui/box';

// Unique dummy data for each metric type
const rpmData = [
  { v: 0 },
  { v: 10 },
  { v: 20 },
  { v: 30 },
  { v: 56 },
  { v: 82 },
  { v: 70 },
  { v: 65 },
  { v: 30 },
  { v: 5 },
  { v: 20 },
  { v: 69 },
  { v: 77 },
  { v: 83 },
  { v: 67 },
  { v: 79 },
  { v: 100 },
  { v: 73 },
  { v: 64 },
  { v: 75 },
  { v: 81 },
  { v: 70 },
  { v: 40 },
  { v: 20 },
];

const exhaustTempData = [
  { v: 40 },
  { v: 42 },
  { v: 45 },
  { v: 48 },
  { v: 50 },
  { v: 55 },
  { v: 60 },
  { v: 58 },
  { v: 52 },
  { v: 48 },
  { v: 45 },
  { v: 65 },
  { v: 72 },
  { v: 78 },
  { v: 82 },
  { v: 85 },
  { v: 90 },
  { v: 88 },
  { v: 80 },
  { v: 75 },
  { v: 70 },
  { v: 68 },
  { v: 65 },
  { v: 62 },
];

const oilPressureData = [
  { v: 60 },
  { v: 62 },
  { v: 64 },
  { v: 66 },
  { v: 65 },
  { v: 63 },
  { v: 61 },
  { v: 60 },
  { v: 58 },
  { v: 55 },
  { v: 57 },
  { v: 59 },
  { v: 61 },
  { v: 63 },
  { v: 65 },
  { v: 67 },
  { v: 68 },
  { v: 66 },
  { v: 64 },
  { v: 62 },
  { v: 60 },
  { v: 58 },
  { v: 56 },
  { v: 55 },
];

const oilTempData = [
  { v: 30 },
  { v: 32 },
  { v: 35 },
  { v: 38 },
  { v: 40 },
  { v: 45 },
  { v: 50 },
  { v: 52 },
  { v: 55 },
  { v: 58 },
  { v: 60 },
  { v: 62 },
  { v: 64 },
  { v: 66 },
  { v: 68 },
  { v: 70 },
  { v: 72 },
  { v: 70 },
  { v: 68 },
  { v: 65 },
  { v: 62 },
  { v: 60 },
  { v: 58 },
  { v: 56 },
];

const coolantTempData = [
  { v: 20 },
  { v: 22 },
  { v: 25 },
  { v: 28 },
  { v: 30 },
  { v: 35 },
  { v: 40 },
  { v: 42 },
  { v: 45 },
  { v: 50 },
  { v: 52 },
  { v: 55 },
  { v: 58 },
  { v: 60 },
  { v: 62 },
  { v: 64 },
  { v: 66 },
  { v: 68 },
  { v: 70 },
  { v: 72 },
  { v: 75 },
  { v: 78 },
  { v: 80 },
  { v: 78 },
];

const consumptionData = [
  { v: 10 },
  { v: 12 },
  { v: 14 },
  { v: 16 },
  { v: 18 },
  { v: 20 },
  { v: 22 },
  { v: 24 },
  { v: 26 },
  { v: 28 },
  { v: 30 },
  { v: 32 },
  { v: 34 },
  { v: 36 },
  { v: 38 },
  { v: 40 },
  { v: 42 },
  { v: 44 },
  { v: 46 },
  { v: 48 },
  { v: 50 },
  { v: 52 },
  { v: 54 },
  { v: 56 },
];

const defaultMetrics = [
  {
    label: 'RPM',
    value: '74',
    unit: 'mm/s',
    showSparkline: true,
    sparklineData: rpmData,
    sparklineColor: '#3872FA',
  },
  {
    label: 'Exhaust Temp',
    value: '435',
    unit: '°C',
    showSparkline: true,
    sparklineData: exhaustTempData,
    sparklineColor: '#FF6B6B',
  },
  {
    label: 'Oil pressure',
    value: '--',
    unit: 'bar',
    showSparkline: true,
    sparklineData: oilPressureData,
    sparklineColor: '#4ECDC4',
  },
  {
    label: 'Oil temp',
    value: '--',
    unit: 'bar',
    showSparkline: true,
    sparklineData: oilTempData,
    sparklineColor: '#45B7D1',
  },
  {
    label: 'Coolant temp',
    value: '--',
    unit: 'bar',
    showSparkline: true,
    sparklineData: coolantTempData,
    sparklineColor: '#96CEB4',
  },
  {
    label: 'Consumption',
    value: 'xx',
    unit: 'l',
    showSparkline: true,
    sparklineData: consumptionData,
    sparklineColor: '#FFEAA7',
  },
];

const machineryData: (Omit<MachineryCardProps, 'alarms'> & {
  engineValue?: string;
})[] = [
  {
    id: 1,
    title: 'ME Port',
    engineValue: 'me1',
    healthScore: 80,
    status: 'running',
    metrics: defaultMetrics,
  },
  {
    id: 2,
    title: 'ME Stbd',
    engineValue: 'me2',
    healthScore: 98,
    status: 'running',
    metrics: defaultMetrics,
  },
  {
    id: 3,
    title: 'ME Center',
    engineValue: 'me3',
    healthScore: 55,
    status: 'standby',
    metrics: defaultMetrics,
  },
  {
    id: 5,
    title: 'Gen Set 1',
    engineValue: 'ae1',
    healthScore: 80,
    status: 'running',
    metrics: defaultMetrics,
  },
  {
    id: 6,
    title: 'Gen Set 2',
    engineValue: 'ae2',
    healthScore: 80,
    status: 'running',
    metrics: defaultMetrics,
  },
  {
    id: 7,
    title: 'Gen Set 3',
    healthScore: 98,
    status: 'off',
    metrics: defaultMetrics,
  },
];

export default function MachineryOverviewPage() {
  const [selectedShip] = useAtom(selectedShipAtom);
  const setSelectedEngine = useSetAtom(selectedEngineAtom);
  const router = useRouter();

  // Lookup engine data for the selected vessel
  const vesselId = selectedShip.id;
  const gensets = vesselGensetData[vesselId] ?? [];

  // Merge real alarm counts from vesselAlarmData into each card
  const cardsWithAlarms = useMemo(
    () =>
      machineryData.map((item) => ({
        ...item,
        alarms: getActiveAlarmCounts(vesselId, item.engineValue),
      })),
    [vesselId]
  );

  // Group cards into rows
  const engines = cardsWithAlarms.filter((item) => item.title.startsWith('ME'));
  const gensetCards = cardsWithAlarms.filter((item) =>
    item.title.startsWith('Gen Set')
  );

  const handleCardClick = (item: (typeof cardsWithAlarms)[number]) => {
    // Find matching engine option; fallback to 'All Engine'
    const match = engineData.find((e) => e.value === item.engineValue);
    setSelectedEngine(match ?? engineData[0]);
    router.push(routes.machinery.conditionMonitoring);
  };

  const renderCard = (item: (typeof cardsWithAlarms)[number]) => (
    <PerfomaxCard
      key={item.id}
      title={item.title}
      accentColor={getHealthColor(item.healthScore)}
      headerRight={<StatusGauge status={item.status} />}
      action={<HealthScoreHeader score={item.healthScore} />}
      onClick={() => handleCardClick(item)}
      className="cursor-pointer transition-opacity hover:opacity-90"
    >
      <MachineryCardBody data={item} engineValue={item.engineValue} />
    </PerfomaxCard>
  );

  return (
    <Box className="pt-5 @container/pd">
      {/* Row 1: Engines */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {engines.map(renderCard)}
      </div>

      {/* Row 2: Gen Sets */}
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {gensetCards.map(renderCard)}
      </div>
    </Box>
  );
}
