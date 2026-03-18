'use client';

import { Text, Badge } from 'rizzui';
import cn from '../../utils/class-names';
import { MachineryCardProps, MachineryAlarms } from '../../types';
import HealthGauge from '../machinery-overview/health-gauge';
import { getHealthColor } from '../../utils/get-health-color';
import { PiWarningFill, PiCaretRightBold } from 'react-icons/pi';

/** Alarm severity config */
const alarmLevels: {
  key: keyof MachineryAlarms;
  bg: string;
  text: string;
  iconColor: string;
}[] = [
  {
    key: 'info',
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    iconColor: 'text-blue-600',
  },
  {
    key: 'notice',
    bg: 'bg-yellow-100',
    text: 'text-yellow-700',
    iconColor: 'text-yellow-500',
  },
  {
    key: 'warning',
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    iconColor: 'text-orange-500',
  },
  {
    key: 'critical',
    bg: 'bg-red-100',
    text: 'text-red-700',
    iconColor: 'text-red-600',
  },
];

export default function MachineryCard({ data }: { data: MachineryCardProps }) {
  const totalAlarms = Object.values(data.alarms).reduce((a, b) => a + b, 0);
  const healthColor = getHealthColor(data.healthScore);

  return (
    <div
      key={data.id}
      className="overflow-hidden rounded-lg border border-muted"
    >
      {/* Top accent bar */}
      <div className="h-1 w-full" style={{ backgroundColor: healthColor }} />

      {/* Header — title left, health score + gauge right */}
      <div className="flex items-center justify-between px-5 pb-2 pt-1">
        <Text as="strong" className="text-md font-bold text-gray-800">
          {data?.title}
        </Text>

        <div className="flex items-center gap-2">
          <Text className="text-center text-[10px] font-semibold leading-tight text-gray-600">
            Health
            <br />
            score
          </Text>
          <HealthGauge value={data.healthScore} size={70} color={healthColor} />
        </div>
      </div>

      {/* Alarms row */}
      <div className="flex items-center justify-between border-t border-muted px-2 py-2">
        <div className="flex items-center gap-2">
          {alarmLevels.map((level) => (
            <div
              key={level.key}
              className={cn(
                'flex items-center gap-1 rounded px-2 py-1'
                // level.bg
              )}
            >
              <PiWarningFill className={cn('size-4', level.iconColor)} />
              <Text as="span" className={cn('text-xs font-bold', level.text)}>
                {data.alarms[level.key]}
              </Text>
            </div>
          ))}
          {/* <Text className="text-xs text-gray-500 ms-1">
            {totalAlarms} Alarms
          </Text> */}
        </div>

        <button className="flex items-center gap-0.5 text-xs font-semibold text-gray-700 hover:text-primary">
          View All
          <PiCaretRightBold className="size-3" />
        </button>
      </div>

      {/* Metrics list */}
      <div className="px-5 pb-4 pt-1">
        {data.metrics.map((metric, idx) => (
          <div
            key={metric.label}
            className={cn(
              'flex items-center justify-between py-2',
              idx < data.metrics.length - 1 &&
                'border-b border-dashed border-muted'
            )}
          >
            <Text className="text-sm font-medium text-gray-700">
              {metric.label}
            </Text>
            <Text className="text-sm font-semibold text-gray-900">
              {metric.value}{' '}
              <Text as="span" className="font-normal text-gray-500">
                {metric.unit}
              </Text>
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
}
