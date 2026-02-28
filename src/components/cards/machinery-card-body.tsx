'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { PiCaretRightBold, PiWarningFill } from 'react-icons/pi';
import { Text } from 'rizzui';
import { MachineryAlarms, MachineryCardProps } from '../../types';
import cn from '../../utils/class-names';
import RpmSparkline from '../machinery-overview/rpm-sparkline';

/* ------------------------------------------------------------------ */
/*  Alarm severity configuration — colours taken from Figma            */
/* ------------------------------------------------------------------ */

const alarmLevels: {
  key: keyof MachineryAlarms;
  color: string;
  circleBg: string;
}[] = [
    { key: 'critical', color: '#FF7270', circleBg: 'rgba(240,80,110,0.2)' },
    { key: 'warning', color: '#E19C4D', circleBg: 'rgba(225,156,77,0.2)' },
    { key: 'notice', color: '#B8A80D', circleBg: 'rgba(219,213,30,0.2)' },
    { key: 'info', color: '#2785E0', circleBg: 'rgba(30,135,240,0.2)' },
  ];

/* ------------------------------------------------------------------ */
/*  Severity → colour mapping for tooltip rows                         */
/* ------------------------------------------------------------------ */

const severityColors: Record<string, { icon: string; bg: string }> = {
  critical: { icon: '#FF7270', bg: 'rgba(240,80,110,0.15)' },
  warning: { icon: '#E19C4D', bg: 'rgba(225,156,77,0.15)' },
  notice: { icon: '#B8A80D', bg: 'rgba(219,213,30,0.15)' },
  info: { icon: '#2785E0', bg: 'rgba(30,135,240,0.12)' },
};

/* ------------------------------------------------------------------ */
/*  Dummy alarm tooltip data                                           */
/* ------------------------------------------------------------------ */

const dummyAlarmRows = [
  {
    severity: 'critical',
    date: '01.05.25',
    time: '21:02:14',
    description: 'High exhaust temp cyl 3',
    value: '5.0',
    unit: 'kPa',
    level: 'L --',
  },
  {
    severity: 'critical',
    date: '01.05.25',
    time: '17:44:30',
    description: 'Vibration spike bearing #2',
    value: '12.4',
    unit: 'mm/s',
    level: 'L --',
  },
  {
    severity: 'warning',
    date: '01.05.25',
    time: '20:48:07',
    description: 'Oil pressure low ME port',
    value: '2.1',
    unit: 'bar',
    level: 'L 1',
  },
  {
    severity: 'notice',
    date: '01.05.25',
    time: '19:35:42',
    description: 'Coolant temp deviation cyl 5',
    value: '88.3',
    unit: '°C',
    level: 'L 2',
  },
  {
    severity: 'info',
    date: '01.05.25',
    time: '18:12:55',
    description: 'Scheduled maintenance reminder',
    value: '--',
    unit: '--',
    level: 'L --',
  },
  {
    severity: 'info',
    date: '01.05.25',
    time: '16:30:10',
    description: 'Fuel filter replacement due',
    value: '--',
    unit: '--',
    level: 'L --',
  },
];

/* ------------------------------------------------------------------ */
/*  Alarm Tooltip Content (filtered by severity)                       */
/* ------------------------------------------------------------------ */

function AlarmTooltipContent({ severity }: { severity: keyof MachineryAlarms }) {
  const filtered = dummyAlarmRows.filter((r) => r.severity === severity);

  if (filtered.length === 0) {
    return (
      <div className="rounded-lg border border-muted bg-gray-0 px-4 py-3 shadow-xl dark:bg-gray-100">
        <Text className="text-xs text-muted-foreground">No {severity} alarms</Text>
      </div>
    );
  }

  return (
    <div className="min-w-[480px] rounded-lg border border-muted bg-gray-0 p-3 shadow-xl dark:bg-gray-100">
      <table className="w-full text-xs">
        <tbody>
          {filtered.map((row, i) => {
            const sc = severityColors[row.severity] ?? severityColors.info;
            return (
              <tr
                key={i}
                className="border-b border-muted/50 last:border-b-0"
              >
                <td className="py-2 pr-2">
                  <span
                    className="flex size-5 items-center justify-center rounded-full"
                    style={{
                      background: sc.bg,
                      border: `0.5px solid ${sc.icon}`,
                    }}
                  >
                    <PiWarningFill className="size-3" style={{ color: sc.icon }} />
                  </span>
                </td>
                <td className="py-2 pr-3 text-muted-foreground">{row.date}</td>
                <td className="py-2 pr-3 text-muted-foreground">{row.time}</td>
                <td className="py-2 pr-3 font-medium">{row.description}</td>
                <td className="py-2 pr-2 text-right">{row.value}</td>
                <td className="py-2 pr-2">{row.unit}</td>
                {/* <td className="py-2">{row.level}</td> */}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function MachineryCardBody({
  data,
}: {
  data: MachineryCardProps;
}) {
  const totalAlarms = Object.values(data.alarms).reduce((a, b) => a + b, 0);

  // Which severity badge is currently hovered (null = none, tooltip hidden)
  const [hoveredSeverity, setHoveredSeverity] = useState<keyof MachineryAlarms | null>(null);

  // Refs for each badge to calculate portal position
  const badgeRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Portal tooltip position (absolute to viewport via fixed positioning)
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null);

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
    setTooltipPos({
      top: rect.bottom + 6, // 6px gap below the badge
      left: rect.left,
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
      <div className="border-t border-muted px-3 pb-3 pt-3">
        {/* Alarms header row */}
        <div className="flex items-center justify-between">
          <Text className="text-xs font-bold">{totalAlarms} New Alarms</Text>

          <button
            className="flex items-center gap-1 text-xs font-bold hover:opacity-80"
            style={{ color: '#2785E0' }}
          >
            View All
            <PiCaretRightBold className="size-4" />
          </button>
        </div>

        {/* Alarm badges — each individually hoverable */}
        <div className="flex items-start justify-between gap-1">
          {alarmLevels.map((level) => (
            <div
              key={level.key}
              ref={(el) => { badgeRefs.current[level.key] = el; }}
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
            <AlarmTooltipContent severity={hoveredSeverity} />
          </div>,
          document.body
        )}

      {/* ── Metrics list ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-[14px] px-3 pb-5 p-0">
        {data.metrics.map((metric) => (
          <div key={metric.label} className="flex items-center gap-2">
            <Text className="shrink-0 text-base font-bold leading-5 opacity-90">
              {metric.label}
            </Text>
            <div className="min-w-[20px] flex-1 border-b border-muted" />
            <Text className="shrink-0 text-right text-base leading-5">
              {metric.value} {metric.unit}
            </Text>
            {metric.showSparkline && <RpmSparkline />}
          </div>
        ))}
      </div>
    </>
  );
}
