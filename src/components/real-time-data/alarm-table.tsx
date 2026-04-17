'use client';

import React from 'react';
import BasicTableWidget from '@/components/controlled-table/basic-table-widget';
import { HeaderCell } from '@/components/legacy-table';
import {
  type AlarmEntry,
  getAlarmUnit,
  getSeverityLabel,
} from '@/data/nura/alarm-data';
import cn from '@/utils/class-names';
import { Badge, Button, Text } from 'rizzui';
import { PiDownloadSimpleBold } from 'react-icons/pi';

// ─── Column definitions (rc-table format for BasicTableWidget) ───────────────

export const getAlarmColumns = ({ sortConfig, onHeaderCellClick }: any) => [
  {
    title: (
      <HeaderCell
        title="Date"
        sortable
        ascending={
          sortConfig?.direction === 'asc' && sortConfig?.key === 'date'
        }
      />
    ),
    onHeaderCell: () => onHeaderCellClick('date'),
    dataIndex: 'timestamp',
    key: 'date',
    width: 110,
    render: (timestamp: number) => (
      <Text className="whitespace-nowrap text-sm">
        {new Date(timestamp).toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        })}
      </Text>
    ),
  },
  {
    title: (
      <HeaderCell
        title="Time"
        sortable
        ascending={
          sortConfig?.direction === 'asc' && sortConfig?.key === 'time'
        }
      />
    ),
    onHeaderCell: () => onHeaderCellClick('time'),
    dataIndex: 'timestamp',
    key: 'time',
    width: 80,
    render: (timestamp: number) => (
      <Text className="whitespace-nowrap text-sm">
        {new Date(timestamp).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })}
      </Text>
    ),
  },
  {
    title: <HeaderCell title="Alarm Text" sortable={false} />,
    dataIndex: 'alarm_text',
    key: 'alarm_text',
    width: 260,
    render: (text: string) => (
      <Text className="text-sm font-medium">{text}</Text>
    ),
  },
  {
    title: (
      <HeaderCell
        title="Engine"
        sortable
        ascending={
          sortConfig?.direction === 'asc' && sortConfig?.key === 'engine'
        }
      />
    ),
    onHeaderCell: () => onHeaderCellClick('engine'),
    dataIndex: 'engine',
    key: 'engine',
    width: 100,
    render: (engine: string) => {
      // Map internal engine codes to display labels
      const displayLabel =
        engine === 'AE1' ? 'Genset 1' : engine === 'AE2' ? 'Genset 2' : engine;
      return (
        <Badge variant="outline" className="text-xs font-medium">
          {displayLabel}
        </Badge>
      );
    },
  },
  // ── Value and Range columns intentionally hidden ─────────────────────────
  // {
  //   title: (
  //     <HeaderCell
  //       title="Value"
  //       sortable
  //       ascending={
  //         sortConfig?.direction === 'asc' && sortConfig?.key === 'value'
  //       }
  //     />
  //   ),
  //   onHeaderCell: () => onHeaderCellClick('value'),
  //   dataIndex: 'value',
  //   key: 'value',
  //   width: 80,
  //   render: (value: number | null) => (
  //     <Text className="text-sm">{value ?? 'N/A'}</Text>
  //   ),
  // },
  // {
  //   title: <HeaderCell title="Range" sortable={false} />,
  //   dataIndex: 'threshold_min',
  //   key: 'range',
  //   width: 120,
  //   render: (_: any, record: AlarmEntry) => {
  //     if (record.threshold_min == null && record.threshold_max == null) {
  //       return <Text className="text-sm">N/A</Text>;
  //     }
  //     let rangeText: string;
  //     if (record.threshold_min != null && record.threshold_max == null) {
  //       rangeText = `≥ ${record.threshold_min}`;
  //     } else if (record.threshold_min == null && record.threshold_max != null) {
  //       rangeText = `≤ ${record.threshold_max}`;
  //     } else {
  //       rangeText = `${record.threshold_min} – ${record.threshold_max}`;
  //     }
  //     return <Text className="whitespace-nowrap text-sm">{rangeText}</Text>;
  //   },
  // },
  {
    title: <HeaderCell title="Unit" sortable={false} />,
    dataIndex: 'alarm_text',
    key: 'unit',
    width: 60,
    render: (alarmText: string, record: AlarmEntry & { unit?: string }) => (
      <Text className="text-sm">{record.unit || getAlarmUnit(alarmText)}</Text>
    ),
  },
  {
    title: (
      <HeaderCell
        title="Severity"
        sortable
        ascending={
          sortConfig?.direction === 'asc' && sortConfig?.key === 'severity'
        }
      />
    ),
    onHeaderCell: () => onHeaderCellClick('severity'),
    dataIndex: 'severity',
    key: 'severity',
    width: 90,
    render: (severity: number) => (
      <Text
        className={cn(
          'text-sm font-semibold',
          severity === 1 ? 'text-red-500' : 'text-gray-600'
        )}
      >
        {getSeverityLabel(severity)}
      </Text>
    ),
  },
  {
    title: (
      <HeaderCell
        title="Status"
        sortable
        ascending={
          sortConfig?.direction === 'asc' && sortConfig?.key === 'status'
        }
      />
    ),
    onHeaderCell: () => onHeaderCellClick('status'),
    dataIndex: 'status',
    key: 'status',
    width: 100,
    render: (status: string) => (
      <Badge
        variant="flat"
        className="font-medium capitalize"
        color={status === 'active' ? 'danger' : 'success'}
      >
        {status}
      </Badge>
    ),
  },
];

// ─── CSV export helpers ──────────────────────────────────────────────────────

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/** Escape a CSV cell per RFC 4180. */
function csvCell(value: unknown): string {
  const s = value == null ? '' : String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function buildAlarmsCsv(rows: AlarmEntry[]): string {
  const header = [
    'Date',
    'Time',
    'Alarm Text',
    'Engine',
    'Unit',
    'Severity',
    'Status',
  ];
  const body = rows.map((r) =>
    [
      formatDate(r.timestamp),
      formatTime(r.timestamp),
      r.alarm_text,
      r.engine === 'AE1'
        ? 'Genset 1'
        : r.engine === 'AE2'
          ? 'Genset 2'
          : r.engine,
      (r as AlarmEntry & { unit?: string }).unit || getAlarmUnit(r.alarm_text),
      getSeverityLabel(r.severity),
      r.status,
    ]
      .map(csvCell)
      .join(',')
  );
  return [header.join(','), ...body].join('\r\n');
}

function triggerCsvDownload(csv: string, filename: string) {
  // Prepend BOM so Excel reliably detects UTF-8 with special characters.
  const blob = new Blob(['\uFEFF', csv], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ─── Component ───────────────────────────────────────────────────────────────

interface AlarmTableProps {
  data: AlarmEntry[];
  title?: string;
  className?: string;
  filterElement?: React.ReactNode;
  /** Base filename (no extension) used when the user downloads the CSV. */
  downloadFileName?: string;
}

export default function AlarmTable({
  data,
  title = 'Alarms List',
  className,
  filterElement,
  downloadFileName = 'alarms',
}: AlarmTableProps) {
  const handleDownload = () => {
    const csv = buildAlarmsCsv(data);
    const stamp = new Date()
      .toISOString()
      .replace(/[:.]/g, '-')
      .slice(0, 19);
    triggerCsvDownload(csv, `${downloadFileName}-${stamp}.csv`);
  };

  const combinedFilterElement = (
    <div className="flex items-center gap-2">
      {filterElement}
      <Button
        size="sm"
        variant="outline"
        onClick={handleDownload}
        disabled={data.length === 0}
        className="h-9 whitespace-nowrap"
      >
        <PiDownloadSimpleBold className="me-1.5 h-4 w-4" />
        Download CSV
      </Button>
    </div>
  );

  return (
    <BasicTableWidget
      title={title}
      data={data}
      getColumns={getAlarmColumns}
      pageSize={1000} // Increase max so everything shows when scrolling
      enablePagination={false}
      enableSearch
      searchPlaceholder="Search alarms..."
      variant="modern"
      scroll={{ x: 1000, y: '50vh' }}
      filterElement={combinedFilterElement}
      className={cn(
        'pb-0 lg:pb-0 [&_.rc-table-row:last-child_td]:border-b-0',
        className
      )}
    />
  );
}
