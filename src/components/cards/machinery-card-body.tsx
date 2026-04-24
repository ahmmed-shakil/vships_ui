'use client';

import { engineData } from '@/data/nura/ships';
import { selectedEngineAtom } from '@/store/condition-monitoring-atoms';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { PiCaretRightBold, PiWarningFill } from 'react-icons/pi';
import { Text } from 'rizzui';
import { routes } from '../../config/routes';
import { MachineryAlarms, MachineryCardProps } from '../../types';
import cn from '../../utils/class-names';
import RpmSparkline from '../machinery-overview/rpm-sparkline';
import { useSetAtom } from 'jotai';

/* ------------------------------------------------------------------ */
/*  Alarm severity configuration — colours taken from Figma            */
/* ------------------------------------------------------------------ */

const alarmLevels: {
  key: keyof MachineryAlarms;
  color: string;
  circleBg: string;
}[] = [
  { key: 'critical', color: '#E19C4D', circleBg: 'rgba(225,156,77,0.2)' },
  { key: 'warning', color: '#E19C4D', circleBg: 'rgba(225,156,77,0.2)' },
  { key: 'notice', color: '#E19C4D', circleBg: 'rgba(225,156,77,0.2)' },
  { key: 'info', color: '#E19C4D', circleBg: 'rgba(225,156,77,0.2)' },
];

/* ------------------------------------------------------------------ */
/*  Severity → colour mapping for tooltip rows                         */
/* ------------------------------------------------------------------ */

const severityColors: Record<string, { icon: string; bg: string }> = {
  critical: { icon: '#E19C4D', bg: 'rgba(225,156,77,0.15)' },
  warning: { icon: '#E19C4D', bg: 'rgba(225,156,77,0.15)' },
  notice: { icon: '#E19C4D', bg: 'rgba(225,156,77,0.15)' },
  info: { icon: '#E19C4D', bg: 'rgba(225,156,77,0.15)' },
};

type TooltipAlarmRow = {
  severity: keyof MachineryAlarms;
  date: string;
  time: string;
  description: string;
  value: string;
  unit: string;
};

function formatAlarmDateTime(timestamp: number | string | null | undefined) {
  if (timestamp == null) {
    return { date: '--', time: '--' };
  }

  const date = (() => {
    if (typeof timestamp === 'number') {
      const ms =
        Math.abs(timestamp) < 1_000_000_000_000 ? timestamp * 1000 : timestamp;
      return new Date(ms);
    }

    const raw = timestamp.trim();
    const isNumeric = /^-?\d+(\.\d+)?$/.test(raw);
    if (isNumeric) {
      const asNumber = Number.parseFloat(raw);
      const ms =
        Math.abs(asNumber) < 1_000_000_000_000 ? asNumber * 1000 : asNumber;
      return new Date(ms);
    }

    return new Date(raw);
  })();

  if (Number.isNaN(date.getTime())) {
    return { date: '--', time: '--' };
  }

  return {
    date: date.toLocaleDateString('en-GB'),
    time: date.toLocaleTimeString('en-GB', { hour12: false }),
  };
}

/* ------------------------------------------------------------------ */
/*  Alarm Tooltip Content (filtered by severity)                       */
/* ------------------------------------------------------------------ */

function AlarmTooltipContent({
  severity,
  count,
  alarmRows = [],
}: {
  severity: keyof MachineryAlarms;
  count: number;
  alarmRows?: MachineryCardProps['alarmRows'];
}) {
  const filtered: TooltipAlarmRow[] = alarmRows
    .filter((row) => row.category === severity)
    .slice(0, count)
    .map((row) => {
      const formatted = formatAlarmDateTime(row.timestamp);
      return {
        severity,
        date: formatted.date,
        time: formatted.time,
        description: row.alarm_text,
        value: row.value == null ? '--' : String(row.value),
        unit: row.unit || '--',
      };
    });

  if (count === 0 || filtered.length === 0) {
    return (
      <div className="rounded-lg border border-muted bg-gray-0 px-4 py-3 shadow-xl dark:bg-gray-100">
        <Text className="text-xs text-muted-foreground">
          No {severity} alarms
        </Text>
      </div>
    );
  }

  return (
    <div className="min-w-[480px] rounded-lg border border-muted bg-gray-0 p-3 shadow-xl dark:bg-gray-100">
      <div className="max-h-72 overflow-y-auto">
        <table className="w-full text-xs">
          <tbody>
            {filtered.map((row, i) => {
              const sc = severityColors[row.severity] ?? severityColors.info;
              return (
                <tr key={i} className="border-b border-muted/50 last:border-b-0">
                  <td className="py-2 pr-2">
                    <span
                      className="flex size-5 items-center justify-center rounded-full"
                      style={{
                        background: sc.bg,
                        border: `0.5px solid ${sc.icon}`,
                      }}
                    >
                      <PiWarningFill
                        className="size-3"
                        style={{ color: sc.icon }}
                      />
                    </span>
                  </td>
                  <td className="py-2 pr-3 text-muted-foreground">{row.date}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{row.time}</td>
                  <td className="py-2 pr-3 font-medium">{row.description}</td>
                  <td className="py-2 pr-2 text-right">{row.value}</td>
                  <td className="py-2 pr-2">{row.unit}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function MachineryCardBody({
  data,
  engineValue,
}: {
  data: MachineryCardProps;
  engineValue?: string;
}) {
  const totalAlarms = Object.values(data.alarms).reduce((a, b) => a + b, 0);
  const setSelectedEngine = useSetAtom(selectedEngineAtom);

  // Which severity badge is currently hovered (null = none, tooltip hidden)
  const [hoveredSeverity, setHoveredSeverity] = useState<
    keyof MachineryAlarms | null
  >(null);

  // Refs for each badge to calculate portal position
  const badgeRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Portal tooltip position (absolute to viewport via fixed positioning)
  const [tooltipPos, setTooltipPos] = useState<{
    top: number;
    left: number;
  } | null>(null);

  // Ref on the portal tooltip itself for mouse-enter/leave
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Hide timer to allow mouse to travel from badge to tooltip
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHideTimer = useCallback(() => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }, []);

  const scheduleHide = useCallback(() => {
    clearHideTimer();
    hideTimer.current = setTimeout(() => {
      setHoveredSeverity(null);
      setTooltipPos(null);
    }, 150);
  }, [clearHideTimer]);

  // Calculate position when severity changes
  useEffect(() => {
    if (!hoveredSeverity) {
      setTooltipPos(null);
      return;
    }
    const el = badgeRefs.current[hoveredSeverity];
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const tooltipWidth = 500; // Approximate tooltip width
    const viewportWidth = window.innerWidth;

    // Calculate left position, clamping to stay within viewport
    let leftPos = rect.left;
    if (leftPos + tooltipWidth > viewportWidth - 16) {
      // Tooltip would overflow right side, shift it left
      leftPos = Math.max(16, viewportWidth - tooltipWidth - 16);
    }

    setTooltipPos({
      top: rect.bottom + 6, // 6px gap below the badge
      left: leftPos,
    });
  }, [hoveredSeverity]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  const handleBadgeEnter = (key: keyof MachineryAlarms) => {
    clearHideTimer();
    setHoveredSeverity(key);
  };

  const handleBadgeLeave = () => {
    scheduleHide();
  };

  const handleTooltipEnter = () => {
    clearHideTimer();
  };

  const handleTooltipLeave = () => {
    scheduleHide();
  };

  return (
    <>
      {/* ── Alarms section ───────────────────────────────────────── */}
      <div
        className="border-t border-muted px-3 pb-3 pt-3"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Alarms header row */}
        <div className="flex items-center justify-between">
          <Text className="text-xs font-bold">{totalAlarms} New Alarms</Text>

          <Link
            href={routes.machinery.alarmOverview}
            className="flex items-center gap-1 text-xs font-bold hover:opacity-80"
            style={{ color: '#2785E0' }}
            onClick={(e) => {
              if (engineValue) {
                const match = engineData.find(
                  (eng) => eng.value === engineValue
                );
                if (match) setSelectedEngine(match);
              }
            }}
          >
            View All
            <PiCaretRightBold className="size-4" />
          </Link>
        </div>

        {/* Alarm badges — each individually hoverable */}
        <div className="flex items-start justify-between gap-1">
          {alarmLevels.map((level) => (
            <div
              key={level.key}
              ref={(el) => {
                badgeRefs.current[level.key] = el;
              }}
              className={cn(
                'flex flex-1 cursor-pointer items-center justify-center gap-[5px] rounded py-[9px] transition-opacity',
                hoveredSeverity && hoveredSeverity !== level.key && 'opacity-40'
              )}
              onMouseEnter={() => handleBadgeEnter(level.key)}
              onMouseLeave={handleBadgeLeave}
            >
              <Text
                as="span"
                className="text-base font-bold leading-5"
                style={{ color: level.color }}
              >
                {data.alarms[level.key]}
              </Text>
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

      {/* ── Portal tooltip (renders at document.body, escapes overflow) ── */}
      {hoveredSeverity &&
        tooltipPos &&
        typeof window !== 'undefined' &&
        createPortal(
          <div
            ref={tooltipRef}
            className="pointer-events-auto fixed z-[9999]"
            style={{ top: tooltipPos.top, left: tooltipPos.left }}
            onMouseEnter={handleTooltipEnter}
            onMouseLeave={handleTooltipLeave}
          >
            <AlarmTooltipContent
              severity={hoveredSeverity}
              count={data.alarms[hoveredSeverity]}
              alarmRows={data.alarmRows}
            />
          </div>,
          document.body
        )}

      {/* ── Metrics list ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-[14px] p-0 px-3 pb-5">
        {data.metrics.map((metric) => (
          <div key={metric.label} className="flex items-center gap-2">
            <Text className="shrink-0 text-base font-bold leading-5 opacity-90">
              {metric.label}
            </Text>
            <div className="min-w-[20px] flex-1 border-b border-muted" />
            <Text className="shrink-0 text-right text-base leading-5">
              {metric.value} {metric.unit}
            </Text>
            {metric.showSparkline && (
              <RpmSparkline
                data={metric.sparklineData}
                color={metric.sparklineColor}
              />
            )}
          </div>
        ))}
      </div>
    </>
  );
}
