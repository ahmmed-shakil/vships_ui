'use client';

import AlarmTable from '@/components/real-time-data/alarm-table';
import { useAlarmsWithSummary } from '@/hooks/use-machinery-data';
import {
  selectedEngineAtom,
  selectedShipAtom,
} from '@/store/condition-monitoring-atoms';
import { useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { PiWarningFill } from 'react-icons/pi';
import { Text } from 'rizzui';
import { Box } from 'rizzui/box';

// Severity color config matching machinery-overview cards
const severityConfig = {
  critical: { color: '#FF7270', bgColor: 'rgba(240,80,110,0.2)' },
  warning: { color: '#E19C4D', bgColor: 'rgba(225,156,77,0.2)' },
  notice: { color: '#B8A80D', bgColor: 'rgba(219,213,30,0.2)' },
  info: { color: '#2785E0', bgColor: 'rgba(30,135,240,0.2)' },
};

// Alarm summary card for severity overview
function AlarmSummaryCard({
  title,
  count,
  color,
  bgColor,
}: {
  title: string;
  count: number;
  color: string;
  bgColor: string;
}) {
  return (
    <div
      className="flex items-center gap-3 rounded-lg border border-muted bg-gray-0 p-4 dark:bg-gray-50"
      style={{ borderLeftWidth: 4, borderLeftColor: color }}
    >
      <span
        className="flex size-10 items-center justify-center rounded-full"
        style={{ backgroundColor: bgColor }}
      >
        <PiWarningFill className="size-5" style={{ color }} />
      </span>
      <div>
        <Text className="text-2xl font-bold">{count}</Text>
        <Text className="text-sm text-muted-foreground">{title}</Text>
      </div>
    </div>
  );
}

export default function AlarmOverviewPage() {
  const selectedShip = useAtomValue(selectedShipAtom);
  const selectedEngine = useAtomValue(selectedEngineAtom);

  // Build query params for the API here
  const queryParams = useMemo(() => {
    const params: { engine?: string } = {};
    if (selectedEngine?.value && selectedEngine.value !== 'all') {
      params.engine = selectedEngine.value;
    }
    return params;
  }, [selectedEngine]);

  const { alarms, summary, isLoading } = useAlarmsWithSummary(queryParams);

  if (!selectedShip) {
    return (
      <Box className="flex h-96 items-center justify-center">
        <span className="text-muted-foreground">Loading vessel data…</span>
      </Box>
    );
  }

  return (
    <Box className="pt-5 @container/pd">
      {/* Alarm Summary Cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-7">
        <AlarmSummaryCard
          title="Critical"
          count={summary.critical}
          color={severityConfig.critical.color}
          bgColor={severityConfig.critical.bgColor}
        />
        <AlarmSummaryCard
          title="Warning"
          count={summary.warning}
          color={severityConfig.warning.color}
          bgColor={severityConfig.warning.bgColor}
        />
        <AlarmSummaryCard
          title="Notice"
          count={summary.notice}
          color={severityConfig.notice.color}
          bgColor={severityConfig.notice.bgColor}
        />
        <AlarmSummaryCard
          title="Info"
          count={summary.info}
          color={severityConfig.info.color}
          bgColor={severityConfig.info.bgColor}
        />
        <AlarmSummaryCard
          title="Active"
          count={summary.active}
          color="#EF4444"
          bgColor="rgba(239,68,68,0.15)"
        />
        <AlarmSummaryCard
          title="Resolved"
          count={summary.resolved}
          color="#22C55E"
          bgColor="rgba(34,197,94,0.15)"
        />
        <AlarmSummaryCard
          title="Total"
          count={summary.total}
          color="#6B7280"
          bgColor="rgba(107,114,128,0.15)"
        />
      </div>

      {/* Alarm Table */}
      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <span className="animate-pulse text-muted-foreground">
            Loading alarms…
          </span>
        </div>
      ) : (
        <AlarmTable
          data={alarms}
          title={`Alarms — ${selectedShip.label}${selectedEngine?.value && selectedEngine.value !== 'all' ? ` — ${selectedEngine.label}` : ''}`}
        />
      )}
    </Box>
  );
}
