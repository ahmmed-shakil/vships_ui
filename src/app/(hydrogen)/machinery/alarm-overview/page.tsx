'use client';

import AlarmTable from '@/components/alarm-monitor/alarm-table';
import {
  engineValueToAlarmEngine,
  vesselAlarmData,
  type AlarmEntry,
} from '@/data/nura/alarm-data';
import {
  selectedEngineAtom,
  selectedShipAtom,
} from '@/store/condition-monitoring-atoms';
import { useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { Box } from 'rizzui/box';
import { Text } from 'rizzui';
import { PiWarningFill } from 'react-icons/pi';

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
  // Get selected ship & engine from global header dropdown
  const selectedShip = useAtomValue(selectedShipAtom);
  const selectedEngine = useAtomValue(selectedEngineAtom);

  // Get alarm data for the selected vessel, optionally filtered by engine
  const alarms = useMemo(() => {
    const all = vesselAlarmData[selectedShip.id] ?? [];
    if (selectedEngine.value === 'all') return all;
    const engineName = engineValueToAlarmEngine[selectedEngine.value];
    if (!engineName) return all;
    return all.filter((a) => a.engine === engineName);
  }, [selectedShip.id, selectedEngine.value]);

  // Calculate alarm counts by category (matching machinery-overview)
  const alarmStats = useMemo(() => {
    const counts = { critical: 0, warning: 0, notice: 0, info: 0 };
    // Category counts only for active alarms (matching machinery-overview cards)
    alarms.forEach((alarm) => {
      if (alarm.status === 'active') {
        counts[alarm.category]++;
      }
    });

    const activeCount = alarms.filter((a) => a.status === 'active').length;
    const resolvedCount = alarms.filter((a) => a.status === 'resolved').length;

    return {
      ...counts,
      total: alarms.length,
      active: activeCount,
      resolved: resolvedCount,
    };
  }, [alarms]);

  return (
    <Box className="pt-5 @container/pd">
      {/* Alarm Summary Cards - matching machinery-overview severity colors */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-7">
        <AlarmSummaryCard
          title="Critical"
          count={alarmStats.critical}
          color={severityConfig.critical.color}
          bgColor={severityConfig.critical.bgColor}
        />
        <AlarmSummaryCard
          title="Warning"
          count={alarmStats.warning}
          color={severityConfig.warning.color}
          bgColor={severityConfig.warning.bgColor}
        />
        <AlarmSummaryCard
          title="Notice"
          count={alarmStats.notice}
          color={severityConfig.notice.color}
          bgColor={severityConfig.notice.bgColor}
        />
        <AlarmSummaryCard
          title="Info"
          count={alarmStats.info}
          color={severityConfig.info.color}
          bgColor={severityConfig.info.bgColor}
        />
        <AlarmSummaryCard
          title="Active"
          count={alarmStats.active}
          color="#EF4444"
          bgColor="rgba(239,68,68,0.15)"
        />
        <AlarmSummaryCard
          title="Resolved"
          count={alarmStats.resolved}
          color="#22C55E"
          bgColor="rgba(34,197,94,0.15)"
        />
        <AlarmSummaryCard
          title="Total"
          count={alarmStats.total}
          color="#6B7280"
          bgColor="rgba(107,114,128,0.15)"
        />
      </div>

      {/* Alarm Table */}
      <AlarmTable
        data={alarms}
        title={`Alarms — ${selectedShip.label}${selectedEngine.value !== 'all' ? ` — ${selectedEngine.label}` : ''}`}
      />
    </Box>
  );
}
