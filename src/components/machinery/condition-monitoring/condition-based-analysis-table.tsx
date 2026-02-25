'use client';

import BasicTableWidget from '@/components/controlled-table/basic-table-widget';
import { conditionAnalysisData } from '@/data/nura/condition-based-analysis-data';
import cn from '@/utils/class-names';
import { Text } from 'rizzui';

// ─── Column definitions ──────────────────────────────────────────────────────

const getColumns = () => [
    {
        title: <Text as="span" fontWeight="semibold" className="block">Spare</Text>,
        dataIndex: 'spare',
        key: 'spare',
        width: 200,
        render: (spare: string) => <Text className="text-sm">{spare}</Text>,
    },
    {
        title: <Text as="span" fontWeight="semibold" className="block">Life (hrs)</Text>,
        dataIndex: 'lifeHrs',
        key: 'lifeHrs',
        width: 120,
        render: (v: number) => <Text className="text-sm font-mono">{v.toLocaleString()}</Text>,
    },
    {
        title: <Text as="span" fontWeight="semibold" className="block">Effective Life</Text>,
        dataIndex: 'effectiveLife',
        key: 'effectiveLife',
        width: 130,
        render: (v: number) => <Text className="text-sm font-mono">{v.toLocaleString()}</Text>,
    },
    {
        title: <Text as="span" fontWeight="semibold" className="block">Remaining Life</Text>,
        dataIndex: 'remainingLife',
        key: 'remainingLife',
        width: 140,
        render: (v: number) => <Text className="text-sm font-mono">{v.toLocaleString()}</Text>,
    },
    {
        title: <Text as="span" fontWeight="semibold" className="block">Confidence</Text>,
        dataIndex: 'confidence',
        key: 'confidence',
        width: 110,
        render: (v: number) => <Text className="text-sm font-mono">{v}%</Text>,
    },
    {
        title: <Text as="span" fontWeight="semibold" className="block">PMS Link</Text>,
        dataIndex: 'pmsLink',
        key: 'pmsLink',
        width: 100,
        render: (link: string) => (
            <a href="#" className="text-sm text-blue-500 hover:underline">{link}</a>
        ),
    },
    {
        title: <Text as="span" fontWeight="semibold" className="block">Status</Text>,
        dataIndex: 'status',
        key: 'status',
        width: 100,
        render: (status: string) => {
            const colors: Record<string, string> = {
                critical: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
                warning: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
                ok: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
            };
            return (
                <span className={cn('inline-block rounded px-3 py-1 text-xs font-semibold capitalize', colors[status] ?? colors.ok)}>
                    {status === 'ok' ? 'OK' : 'Status'}
                </span>
            );
        },
    },
];

// ─── Component ───────────────────────────────────────────────────────────────

interface ConditionBasedAnalysisTableProps {
    className?: string;
}

export default function ConditionBasedAnalysisTable({ className }: ConditionBasedAnalysisTableProps) {
    return (
        <BasicTableWidget
            title="Condition Based Analysis"
            data={conditionAnalysisData}
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
