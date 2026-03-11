'use client';

import BasicTableWidget from '@/components/controlled-table/basic-table-widget';
import { HeaderCell } from '@/components/legacy-table';
import { type AlarmEntry, getAlarmUnit, getSeverityLabel } from '@/data/nura/alarm-data';
import cn from '@/utils/class-names';
import { Badge, Text } from 'rizzui';
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
                    year: 'numeric', month: '2-digit', day: '2-digit',
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
                    hour: '2-digit', minute: '2-digit', hour12: false,
                })}
            </Text>
        ),
    },
    {
        title: (
            <HeaderCell
                title="Alarm Text"
                sortable={false}
            />
        ),
        dataIndex: 'alarm_text',
        key: 'alarm_text',
        width: 220,
        render: (text: string) => (
            <Text className="text-sm font-medium">{text}</Text>
        ),
    },
    {
        title: (
            <HeaderCell
                title="Engine"
                sortable={false}
            />
        ),
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
        title: (
            <HeaderCell
                title="Value"
                sortable
                ascending={
                    sortConfig?.direction === 'asc' && sortConfig?.key === 'value'
                }
            />
        ),
        onHeaderCell: () => onHeaderCellClick('value'),
        dataIndex: 'value',
        key: 'value',
        width: 80,
        render: (value: number | null) => (
            <Text className="text-sm">{value ?? 'N/A'}</Text>
        ),
    },
    {
        title: (
            <HeaderCell
                title="Range"
                sortable={false}
            />
        ),
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
        title: (
            <HeaderCell
                title="Unit"
                sortable={false}
            />
        ),
        dataIndex: 'alarm_text',
        key: 'unit',
        width: 60,
        render: (alarmText: string) => (
            <Text className="text-sm">{getAlarmUnit(alarmText)}</Text>
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
            pageSize={1000} // Increase max so everything shows when scrolling
            enablePagination={false}
            enableSearch
            searchPlaceholder="Search alarms..."
            variant="modern"
            scroll={{ x: 1100, y: '50vh' }}
            className={cn(
                'pb-0 lg:pb-0 [&_.rc-table-row:last-child_td]:border-b-0',
                className
            )}
        />
    );
}
