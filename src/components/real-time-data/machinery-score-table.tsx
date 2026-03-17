'use client';

import BasicTableWidget from '@/components/controlled-table/basic-table-widget';
import { vesselMachineryScores } from '@/data/nura/machinery-data';
import cn from '@/utils/class-names';
import { useMemo } from 'react';
import { Text } from 'rizzui';

// ─── Column definitions ──────────────────────────────────────────────────────

const getColumns = () => [
    {
        title: <Text as="span" fontWeight="semibold" className="block">Name</Text>,
        dataIndex: 'name',
        key: 'name',
        width: 140,
        render: (name: string) => (
            <Text className="text-sm font-medium">{name}</Text>
        ),
    },
    {
        title: <Text as="span" fontWeight="semibold" className="block">Value</Text>,
        dataIndex: 'value',
        key: 'value',
        width: 80,
        render: (value: string) => (
            <Text className="text-sm font-mono">{value}</Text>
        ),
    },
    {
        title: <Text as="span" fontWeight="semibold" className="block">Status</Text>,
        dataIndex: 'status',
        key: 'status',
        width: 60,
        render: (status: string) => (
            <span className="inline-flex items-center justify-center">
                <svg width="36" height="27" viewBox="0 0 36 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect
                        width="36" height="27" rx="4.5"
                        fill={status === 'active' ? '#43944E' : '#E1504D'}
                        fillOpacity="0.2"
                    />
                    <circle
                        cx="18" cy="14" r="4"
                        fill={status === 'active' ? '#389645' : '#E1504D'}
                    />
                </svg>
            </span>
        ),
    },
];

// ─── Component ───────────────────────────────────────────────────────────────

interface MachineryScoreTableProps {
    vesselId: number;
    className?: string;
}

export default function MachineryScoreTable({ vesselId, className }: MachineryScoreTableProps) {
    const data = useMemo(
        () => vesselMachineryScores[vesselId] ?? [],
        [vesselId]
    );

    return (
        <BasicTableWidget
            title="Machinery Condition Score"
            data={data}
            getColumns={getColumns}
            enableSearch={false}
            enablePagination={false}
            variant="modern"
            scroll={{ x: 280 }}
            className={cn(
                'pb-0 lg:pb-0 [&_.rc-table-row:last-child_td]:border-b-0',
                className
            )}
        />
    );
}
