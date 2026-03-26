'use client';

import HealthScoreHeader from '@/components/cards/health-score-header';
import MachineryCardBody from '@/components/cards/machinery-card-body';
import PerfomaxCard from '@/components/cards/perfomax-card';
import StatusGauge from '@/components/machinery-overview/status-gauge';
import { routes } from '@/config/routes';
import { engineData } from '@/data/nura/ships';
import { useMachineryOverview } from '@/hooks/use-machinery-data';
import {
  selectedEngineAtom,
  selectedShipAtom,
} from '@/store/condition-monitoring-atoms';
import type { MachineryCardProps, MachineryMetric } from '@/types';
import type { EngineOverviewCard } from '@/types/api';
import { getHealthColor } from '@/utils/get-health-color';
import { useAtomValue, useSetAtom } from 'jotai';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { Box } from 'rizzui/box';

// ─── Convert API engine card to the shape MachineryCardBody expects ──────────

function toMetrics(card: EngineOverviewCard): MachineryMetric[] {
  const m = card.metrics;
  const s = card.sparklines;
  const toSparkline = (arr: number[]) => arr.map((v) => ({ v }));
  const hasData = (v: number | null) => v != null;

  return [
    {
      label: 'RPM',
      value: m.rpm != null ? String(m.rpm) : '--',
      unit: hasData(m.rpm) ? 'rpm' : '',
      showSparkline: hasData(m.rpm),
      sparklineData: toSparkline(s.rpm),
      sparklineColor: 'currentColor',
    },
    {
      label: 'Exhaust Temp',
      value: m.exhaust_temp != null ? String(m.exhaust_temp) : '--',
      unit: hasData(m.exhaust_temp) ? '°C' : '',
      showSparkline: hasData(m.exhaust_temp),
      sparklineData: toSparkline(s.exhaust_temp),
      sparklineColor: 'currentColor',
    },
    {
      label: 'Oil pressure',
      value: m.oil_pressure != null ? String(m.oil_pressure) : '--',
      unit: hasData(m.oil_pressure) ? 'kPa' : '',
      showSparkline: hasData(m.oil_pressure),
      sparklineData: toSparkline(s.oil_pressure),
      sparklineColor: 'currentColor',
    },
    {
      label: 'Oil temp',
      value: m.oil_temp != null ? String(m.oil_temp) : '--',
      unit: hasData(m.oil_temp) ? '°C' : '',
      showSparkline: hasData(m.oil_temp),
      sparklineData: toSparkline(s.oil_temp),
      sparklineColor: 'currentColor',
    },
    {
      label: 'Coolant temp',
      value: m.coolant_temp != null ? String(m.coolant_temp) : '--',
      unit: hasData(m.coolant_temp) ? '°C' : '',
      showSparkline: hasData(m.coolant_temp),
      sparklineData: toSparkline(s.coolant_temp),
      sparklineColor: 'currentColor',
    },
    {
      label: 'Consumption',
      value: m.fuel_consumption != null ? String(m.fuel_consumption) : '--',
      unit: hasData(m.fuel_consumption) ? 'L/H' : '',
      showSparkline: hasData(m.fuel_consumption),
      sparklineData: toSparkline(s.fuel_consumption),
      sparklineColor: 'currentColor',
    },
  ];
}

function toCardProps(card: EngineOverviewCard): Omit<
  MachineryCardProps,
  'alarms'
> & {
  engineValue: string;
  alarms: MachineryCardProps['alarms'];
} {
  return {
    id: card.engine_id.charCodeAt(0),
    title: card.label,
    engineValue: card.engine_id,
    healthScore: card.health_score,
    status: card.status,
    metrics: toMetrics(card),
    alarms: card.alarms,
  };
}

export default function MachineryOverviewPage() {
  const selectedShip = useAtomValue(selectedShipAtom);
  const setSelectedEngine = useSetAtom(selectedEngineAtom);
  const router = useRouter();
  const { engines: apiEngines, loading } = useMachineryOverview();

  if (!selectedShip) {
    return (
      <Box className="flex h-96 items-center justify-center">
        <span className="text-muted-foreground">Loading vessel data…</span>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box className="flex h-96 items-center justify-center">
        <span className="animate-pulse text-muted-foreground">
          Loading machinery data…
        </span>
      </Box>
    );
  }

  const cards = apiEngines.map(toCardProps);

  // Group cards into rows
  const engineCards = cards.filter((item) => item.engineValue.startsWith('me'));
  const gensetCards = cards.filter((item) => item.engineValue.startsWith('ae'));

  const handleCardClick = (item: (typeof cards)[number]) => {
    const match = engineData.find((e) => e.value === item.engineValue);
    setSelectedEngine(match ?? engineData[0]);
    router.push(routes.machinery.conditionMonitoring);
  };

  const renderCard = (item: (typeof cards)[number]) => (
    <PerfomaxCard
      key={item.engineValue}
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
        {engineCards.map(renderCard)}
      </div>

      {/* Row 2: Gen Sets */}
      {gensetCards.length > 0 && (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {gensetCards.map(renderCard)}
        </div>
      )}
    </Box>
  );
}
