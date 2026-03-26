'use client';

import BasicTableWidget from '@/components/controlled-table/basic-table-widget';
import type { SparePartEntry } from '@/types/api';
import cn from '@/utils/class-names';
import { Text } from 'rizzui';

// ─── Column definitions ──────────────────────────────────────────────────────

const getColumns = () => [
  {
    title: (
      <Text as="span" fontWeight="semibold" className="block whitespace-nowrap">
        COMPONENT/SPARE PART
      </Text>
    ),
    dataIndex: 'spare',
    key: 'spare',
    width: 220,
    render: (spare: string) => <Text className="text-sm">{spare}</Text>,
  },
  {
    title: (
      <Text as="span" fontWeight="semibold" className="block whitespace-nowrap">
        DESIGN LIFE (HRS)
      </Text>
    ),
    dataIndex: 'design_life_hrs',
    key: 'design_life_hrs',
    width: 140,
    render: (v: number) => (
      <Text className="font-mono text-sm">{v?.toLocaleString() ?? '-'}</Text>
    ),
  },
  {
    title: (
      <Text as="span" fontWeight="semibold" className="block whitespace-nowrap">
        ADJUSTED LIFE
      </Text>
    ),
    dataIndex: 'effective_life',
    key: 'effective_life',
    width: 120,
    render: (v: number) => (
      <Text className="font-mono text-sm">{v?.toLocaleString() ?? '-'}</Text>
    ),
  },
  {
    title: (
      <Text as="span" fontWeight="semibold" className="block whitespace-nowrap">
        HOURS SINCE OH
      </Text>
    ),
    dataIndex: 'hours_since_oh',
    key: 'hours_since_oh',
    width: 140,
    render: (v: number) => (
      <Text className="font-mono text-sm">{v?.toLocaleString() || '-'}</Text>
    ),
  },
  {
    title: (
      <Text as="span" fontWeight="semibold" className="block whitespace-nowrap">
        REMAINING HRS
      </Text>
    ),
    dataIndex: 'remaining_life',
    key: 'remaining_life',
    width: 130,
    render: (v: number) => (
      <Text className="font-mono text-sm">{v?.toLocaleString() ?? '-'}</Text>
    ),
  },
  {
    title: (
      <Text as="span" fontWeight="semibold" className="block whitespace-nowrap">
        CONDITION %
      </Text>
    ),
    dataIndex: 'condition',
    key: 'condition',
    width: 110,
    render: (v: number) => <Text className="font-mono text-sm">{v}%</Text>,
  },
  {
    title: (
      <Text as="span" fontWeight="semibold" className="block whitespace-nowrap">
        PMS SCHEDULE
      </Text>
    ),
    dataIndex: 'pms_link',
    key: 'pms_link',
    width: 120,
    render: (link: string) =>
      link ? (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-500 hover:underline"
        >
          View
        </a>
      ) : (
        <Text className="text-sm text-muted-foreground">-</Text>
      ),
  },
  {
    title: (
      <Text as="span" fontWeight="semibold" className="block">
        STATUS
      </Text>
    ),
    dataIndex: 'status',
    key: 'status',
    width: 100,
    render: (status: string) => {
      const colors: Record<string, string> = {
        critical:
          'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
        urgent:
          'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
        caution:
          'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
        ok: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
      };
      return (
        <span
          className={cn(
            'inline-block rounded px-3 py-1 text-xs font-semibold uppercase',
            colors[status] ?? colors.ok
          )}
        >
          {status}
        </span>
      );
    },
  },
  {
    title: (
      <Text as="span" fontWeight="semibold" className="block">
        REMARKS
      </Text>
    ),
    dataIndex: 'remarks',
    key: 'remarks',
    width: 250,
    render: (remarks: string) => (
      <Text className="text-sm italic text-gray-500">{remarks}</Text>
    ),
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

interface ConditionBasedAnalysisTableProps {
  className?: string;
  parts?: SparePartEntry[];
  isLoading?: boolean;
}

export default function ConditionBasedAnalysisTable({
  className,
  parts = [],
  isLoading,
}: ConditionBasedAnalysisTableProps) {
  return (
    <BasicTableWidget
      title="Condition Based Analysis"
      data={parts}
      getColumns={getColumns}
      enableSearch={false}
      enablePagination={false}
      variant="modern"
      scroll={{ x: 900 }}
      className={cn(
        'pb-0 lg:pb-0 [&_.rc-table-row:last-child_td]:border-b-0',
        className
      )}
    />
  );
}
