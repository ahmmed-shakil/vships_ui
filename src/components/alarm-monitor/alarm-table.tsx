'use client';

import BasicTableWidget from '@/components/controlled-table/basic-table-widget';
import type { AlarmEntry } from '@/data/nura/alarm-data';
import { getAlarmUnit, getSeverityLabel } from '@/data/nura/alarm-data';
import cn from '@/utils/class-names';
import { Badge, Text } from 'rizzui';

// ─── Column definitions (rc-table format for BasicTableWidget) ───────────────

export const getAlarmColumns = () => [
    {
        title: <Text as="span" fontWeight="semibold" className="block">Date</Text>,
        dataIndex: 'timestamp',
        key: 'date',
        width: 110,
        render: (timestamp: number) => (
            <Text className="whitespace-nowrap text-sm">
                {new Date(timestamp).toLocaleDateString('en-US', {
                    year: 'numeric', month: '2-digit', day: '2-digit',
                })}
            </Text>
        ),
    },
    {
        title: <Text as="span" fontWeight="semibold" className="block">Time</Text>,
        dataIndex: 'timestamp',
        key: 'time',
        width: 80,
        render: (timestamp: number) => (
            <Text className="whitespace-nowrap text-sm">
                {new Date(timestamp).toLocaleTimeString('en-US', {
                    hour: '2-digit', minute: '2-digit', hour12: false,
                })}
            </Text>
        ),
    },
    {
        title: <Text as="span" fontWeight="semibold" className="block">Alarm Text</Text>,
        dataIndex: 'alarm_text',
        key: 'alarm_text',
        width: 220,
        render: (text: string) => (
            <Text className="text-sm font-medium">{text}</Text>
        ),
    },
    {
        title: <Text as="span" fontWeight="semibold" className="block">Engine</Text>,
        dataIndex: 'engine',
        key: 'engine',
        width: 100,
        render: (engine: string) => (
            <Badge variant="outline" className="font-medium text-xs">
                {engine}
            </Badge>
        ),
    },
    {
        title: <Text as="span" fontWeight="semibold" className="block">Value</Text>,
        dataIndex: 'value',
        key: 'value',
        width: 80,
        render: (value: number | null) => (
            <Text className="text-sm">{value ?? 'N/A'}</Text>
        ),
    },
    {
        title: <Text as="span" fontWeight="semibold" className="block">Range</Text>,
        dataIndex: 'threshold_min',
        key: 'range',
        width: 120,
        render: (_: any, record: AlarmEntry) => {
            if (record.threshold_min == null && record.threshold_max == null) {
                return <Text className="text-sm">N/A</Text>;
            }
            return (
                <Text className="text-sm whitespace-nowrap">
                    {record.threshold_min ?? '–'} – {record.threshold_max ?? '–'}
                </Text>
            );
        },
    },
    {
        title: <Text as="span" fontWeight="semibold" className="block">Unit</Text>,
        dataIndex: 'alarm_text',
        key: 'unit',
        width: 60,
        render: (alarmText: string) => (
            <Text className="text-sm">{getAlarmUnit(alarmText)}</Text>
        ),
    },
    {
        title: <Text as="span" fontWeight="semibold" className="block">Severity</Text>,
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
        title: <Text as="span" fontWeight="semibold" className="block">Status</Text>,
        dataIndex: 'status',
        key: 'status',
        width: 100,
        render: (status: string) => (
            <Badge
                variant="flat"
                className="font-medium capitalize"
                color={status === 'active' ? 'success' : 'danger'}
            >
                {status}
            </Badge>
        ),
    },
];

// ─── Component ───────────────────────────────────────────────────────────────

interface AlarmTableProps {
    data: AlarmEntry[];
    title?: string;
    className?: string;
}

export default function AlarmTable({
    data,
    title = 'Alarms List',
    className,
}: AlarmTableProps) {
    return (
        <BasicTableWidget
            title={title}
            data={data}
            getColumns={getAlarmColumns}
            pageSize={10}
            enablePagination
            enableSearch
            searchPlaceholder="Search alarms..."
            variant="modern"
            scroll={{ x: 1100 }}
            className={cn(
                'pb-0 lg:pb-0 [&_.rc-table-row:last-child_td]:border-b-0',
                className
            )}
        />
    );
}
