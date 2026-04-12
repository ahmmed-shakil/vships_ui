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
import { useAtomValue, useSetAtom } from 'jotai';
import { useRouter } from 'next/navigation';
import { Box } from 'rizzui/box';

// TODO: Restore health-score-driven accents: use getHealthColor(card.health_score)
// for sparklines + PerfomaxCard accentColor, and pass real scores to HealthScoreHeader.

/** Neutral accent while health scores are N/A (matches HealthScoreHeader with no score). */
const HEALTH_SCORE_NA_ACCENT = '#9CA3AF';

// ─── Convert API engine card to the shape MachineryCardBody expects ──────────

function toMetrics(card: EngineOverviewCard): MachineryMetric[] {
  const m = card.metrics;
  const s = card.sparklines;
  const toSparkline = (arr: number[]) => arr.map((v) => ({ v }));
  const hasSpark = (arr: number[]) => arr.some((v) => v !== 0);
  const color = HEALTH_SCORE_NA_ACCENT;

  return [
    {
      label: 'RPM',
      value: m.rpm != null ? String(m.rpm) : '--',
      unit: m.rpm != null ? 'rpm' : '',
      showSparkline: hasSpark(s.rpm),
      sparklineData: toSparkline(s.rpm),
      sparklineColor: color,
    },
    {
      label: 'Exhaust Temp',
      value: m.exhaust_temp != null ? String(m.exhaust_temp) : '--',
      unit: m.exhaust_temp != null ? '°C' : '',
      showSparkline: hasSpark(s.exhaust_temp),
      sparklineData: toSparkline(s.exhaust_temp),
      sparklineColor: color,
    },
    {
      label: 'Oil pressure',
      value: m.oil_pressure != null ? String(m.oil_pressure) : '--',
      unit: m.oil_pressure != null ? 'kPa' : '',
      showSparkline: hasSpark(s.oil_pressure),
      sparklineData: toSparkline(s.oil_pressure),
      sparklineColor: color,
    },
    {
      label: 'Oil temp',
      value: m.oil_temp != null ? String(m.oil_temp) : '--',
      unit: m.oil_temp != null ? '°C' : '',
      showSparkline: hasSpark(s.oil_temp),
      sparklineData: toSparkline(s.oil_temp),
      sparklineColor: color,
    },
    {
      label: 'Coolant temp',
      value: m.coolant_temp != null ? String(m.coolant_temp) : '--',
      unit: m.coolant_temp != null ? '°C' : '',
      showSparkline: hasSpark(s.coolant_temp),
      sparklineData: toSparkline(s.coolant_temp),
      sparklineColor: color,
    },
    {
      label: 'Consumption',
      value: m.fuel_consumption != null ? String(m.fuel_consumption) : '--',
      unit: m.fuel_consumption != null ? 'L/H' : '',
      showSparkline: hasSpark(s.fuel_consumption),
      sparklineData: toSparkline(s.fuel_consumption),
      sparklineColor: color,
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

  const mainEngineCards = cards.filter((item) =>
    item.engineValue.startsWith('me')
  );
  const dgCards = cards.filter((item) => item.engineValue.startsWith('dg'));
  const gensetCards = cards.filter((item) => item.engineValue.startsWith('ae'));
  const otherCards = cards.filter(
    (item) =>
      !item.engineValue.startsWith('me') &&
      !item.engineValue.startsWith('dg') &&
      !item.engineValue.startsWith('ae')
  );
  const auxiliaryRow = [...gensetCards, ...otherCards];

  const cardRows = [
    { key: 'me' as const, items: mainEngineCards },
    { key: 'dg' as const, items: dgCards },
    { key: 'aux' as const, items: auxiliaryRow },
  ].filter((row) => row.items.length > 0);

  const handleCardClick = (item: (typeof cards)[number]) => {
    const match = engineData.find((e) => e.value === item.engineValue);
    // `engineData` is static and may not include API-provided `dg*` engines.
    // If there's no match, use the card label/value directly so the header selects the right engine.
    const selected = match ?? { label: item.title, value: item.engineValue };
    setSelectedEngine(selected as any);
    router.push(routes.machinery.conditionMonitoring);
  };

  const renderCard = (item: (typeof cards)[number]) => (
    <PerfomaxCard
      key={item.engineValue}
      title={item.title}
      accentColor={HEALTH_SCORE_NA_ACCENT}
      headerRight={<StatusGauge status={item.status} />}
      action={<HealthScoreHeader score={null} />}
      onClick={() => handleCardClick(item)}
      className="cursor-pointer transition-opacity hover:opacity-90"
    >
      <MachineryCardBody data={item} engineValue={item.engineValue} />
    </PerfomaxCard>
  );

  const gridClass =
    'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4';

  return (
    <Box className="pt-5 @container/pd">
      {cardRows.map((row, index) => (
        <div
          key={row.key}
          className={`${gridClass}${index > 0 ? ' mt-4' : ''}`}
        >
          {row.items.map(renderCard)}
        </div>
      ))}
    </Box>
  );
}
