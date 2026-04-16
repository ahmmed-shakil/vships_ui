'use client';

import AlarmTable from '@/components/real-time-data/alarm-table';
import DateRangePicker from '@/components/date/date-range';
import { useAlarmsWithSummary } from '@/hooks/use-machinery-data';
import {
  dateRangeAtom,
  selectedEngineAtom,
  selectedShipAtom,
  selectedTimeAtom,
} from '@/store/condition-monitoring-atoms';
import cn from '@/utils/class-names';
import { useAtom, useAtomValue } from 'jotai';
import { useMemo, useState } from 'react';
import { PiWarningFill } from 'react-icons/pi';
import { Select, Text } from 'rizzui';
import { Box } from 'rizzui/box';

// ─── Constants ────────────────────────────────────────────────────────────────

const TIME_PRESETS = ['1h', '1d', '7d', '1m', '3m', 'Custom Time'];

const STATUS_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Resolved', value: 'resolved' },
];

// ─── Severity color config ────────────────────────────────────────────────────

const severityConfig = {
  critical: { color: '#FF7270', bgColor: 'rgba(240,80,110,0.2)' },
  warning: { color: '#E19C4D', bgColor: 'rgba(225,156,77,0.2)' },
  notice: { color: '#B8A80D', bgColor: 'rgba(219,213,30,0.2)' },
  info: { color: '#2785E0', bgColor: 'rgba(30,135,240,0.2)' },
};

// ─── Summary card ─────────────────────────────────────────────────────────────

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AlarmOverviewPage() {
  const selectedShip = useAtomValue(selectedShipAtom);
  const selectedEngine = useAtomValue(selectedEngineAtom);

  // Date range — same atoms as condition-monitoring
  const [selectedTime, setSelectedTime] = useAtom(selectedTimeAtom);
  const [dateRange, setDateRange] = useAtom(dateRangeAtom);

  // Status filter — local state; 'all' means no status param sent
  const [statusFilter, setStatusFilter] = useState<{ label: string; value: string }>(
    STATUS_OPTIONS[0]
  );

  const queryParams = useMemo(() => {
    const params: { engine?: string; status?: string } = {};
    if (selectedEngine?.value && selectedEngine.value !== 'all') {
      params.engine = selectedEngine.value;
    }
    if (statusFilter.value !== 'all') {
      params.status = statusFilter.value;
    }
    return params;
  }, [selectedEngine, statusFilter]);

  const { alarms, summary, isLoading } = useAlarmsWithSummary(queryParams);

  if (!selectedShip) {
    return (
      <Box className="flex h-96 items-center justify-center">
        <span className="text-muted-foreground">Loading vessel data…</span>
      </Box>
    );
  }

  // Status dropdown rendered left of the search bar inside AlarmTable
  const statusDropdown = (
    <Select
      options={STATUS_OPTIONS}
      value={statusFilter}
      onChange={(v: { label: string; value: string }) => setStatusFilter(v)}
      className="w-32 shrink-0"
      selectClassName="h-9 text-sm"
      dropdownClassName="text-gray-900"
    />
  );

  return (
    <Box className="pt-5 @container/pd">
      {/* ── Date range header ─────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex shrink-0 overflow-hidden rounded border border-muted">
          {TIME_PRESETS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setSelectedTime(opt)}
              className={cn(
                'border-r border-muted px-4 py-1.5 text-sm transition-all duration-200 last:border-r-0',
                selectedTime === opt
                  ? 'bg-primary/10 font-semibold text-primary'
                  : 'font-medium text-foreground hover:bg-muted/50'
              )}
            >
              {opt}
            </button>
          ))}
        </div>

        {selectedTime === 'Custom Time' && (
          <div className="w-52 shrink-0">
            <DateRangePicker
              startDate={dateRange[0]}
              endDate={dateRange[1]}
              onChange={setDateRange}
              className="h-9 w-full rounded border border-muted bg-background px-3 text-sm focus:ring-0"
              placeholder="Select date range"
            />
          </div>
        )}
      </div>

      {/* ── Summary cards ─────────────────────────────────────────────────── */}
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

      {/* ── Alarm table ───────────────────────────────────────────────────── */}
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
          filterElement={statusDropdown}
        />
      )}
    </Box>
  );
}
