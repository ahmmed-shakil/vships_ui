'use client';

import { Text } from 'rizzui';
import cn from '../../utils/class-names';
import { MachineryCardProps, MachineryAlarms } from '../../types';
import { PiWarningFill, PiCaretRightBold } from 'react-icons/pi';

/* ------------------------------------------------------------------ */
/*  Alarm severity configuration — colours taken from Figma            */
/* ------------------------------------------------------------------ */

const alarmLevels: {
  key: keyof MachineryAlarms;
  /** Badge background */
  bg: string;
  /** Badge border */
  border: string;
  /** Count text + icon fill */
  color: string;
  /** Circle behind the icon */
  circleBg: string;
}[] = [
  {
    key: 'critical',
    bg: 'rgba(240,80,110,0.1)',
    border: 'rgba(240,80,110,0.2)',
    color: '#FF7270',
    circleBg: 'rgba(240,80,110,0.2)',
  },
  {
    key: 'warning',
    bg: 'rgba(225,156,77,0.15)',
    border: 'rgba(225,156,77,0.2)',
    color: '#E19C4D',
    circleBg: 'rgba(225,156,77,0.2)',
  },
  {
    key: 'notice',
    bg: 'rgba(219,213,30,0.15)',
    border: 'rgba(219,213,30,0.2)',
    color: '#B8A80D',
    circleBg: 'rgba(219,213,30,0.2)',
  },
  {
    key: 'info',
    bg: 'rgba(30,135,240,0.1)',
    border: 'rgba(30,135,240,0.2)',
    color: '#2785E0',
    circleBg: 'rgba(30,135,240,0.2)',
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

/**
 * The body (alarms + metrics) portion of a machinery card.
 * Meant to be placed inside a `<PerfomaxCard>` as children.
 */
export default function MachineryCardBody({
  data,
}: {
  data: MachineryCardProps;
}) {
  const totalAlarms = Object.values(data.alarms).reduce((a, b) => a + b, 0);

  return (
    <>
      {/* ── Alarms section ───────────────────────────────────────── */}
      <div className="border-t border-muted px-3 pb-3 pt-3">
        {/* Alarms header row */}
        <div className="mb-1.5 flex items-center justify-between">
          <Text className="text-base font-bold">{totalAlarms} New Alarms</Text>

          <button
            className="flex items-center gap-1 text-sm font-bold hover:opacity-80"
            style={{ color: '#2785E0' }}
          >
            View All
            <PiCaretRightBold className="size-4" />
          </button>
        </div>

        {/* Alarm badges */}
        <div className="flex items-start justify-between gap-1">
          {alarmLevels.map((level) => (
            <div
              key={level.key}
              className="flex flex-1 items-center justify-center gap-[5px] rounded py-[9px]"
              style={{
                background: level.bg,
                border: `0.5px solid ${level.border}`,
              }}
            >
              <Text
                as="span"
                className="text-base font-bold leading-5"
                style={{ color: level.color }}
              >
                {data.alarms[level.key]}
              </Text>
              {/* Circular icon */}
              <span
                className="flex size-6 items-center justify-center rounded-full"
                style={{
                  background: level.circleBg,
                  border: `0.5px solid ${level.color}`,
                }}
              >
                <PiWarningFill
                  className="size-[18px]"
                  style={{ color: level.color }}
                />
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Metrics list ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-[14px] px-3 pb-5 pt-3">
        {data.metrics.map((metric, idx) => (
          <div key={metric.label} className="flex items-baseline gap-2">
            {/* Label */}
            <Text className="shrink-0 text-base font-bold leading-5 opacity-90">
              {metric.label}
            </Text>

            {/* Dotted separator — grows to fill */}
            <div className="min-w-[20px] flex-1 border-b border-muted" />

            {/* Value + unit */}
            <Text className="shrink-0 text-right text-base leading-5">
              {metric.value} {metric.unit}
            </Text>
          </div>
        ))}
      </div>
    </>
  );
}
