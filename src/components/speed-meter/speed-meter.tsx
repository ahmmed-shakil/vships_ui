'use client';

import WidgetCard from '@/components/cards/widget-card';
import { Cell, Label, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { Button } from 'rizzui';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SpeedMeterSegment {
  name: string;
  value: number;
  color?: string;
}

export type SpeedMeterSize = 'sm' | 'default' | 'lg';

export interface SpeedMeterProps {
  /** Card title (e.g. "ME PORT") */
  title?: string;

  /** Current value — used when rendering a single-value gauge */
  value?: number;
  /** Maximum value for the gauge scale (default: 100) */
  max?: number;
  /** Minimum value for the gauge scale (default: 0) */
  min?: number;

  /** Text displayed at the very center of the arc (e.g. "100%") */
  centerLabel?: string;

  /**
   * Multi-segment data. When provided the arc is split into colored segments
   * and a legend is shown below. Each segment needs a `name` and `value`;
   * an optional `color` overrides the default fill.
   */
  segments?: SpeedMeterSegment[];

  /** Arc fill color for single-value mode (default: "#3B82F6" — blue) */
  fillColor?: string;
  /** Arc track / background color (default: "#D1D5DB" — gray) */
  trackColor?: string;

  /** Show the "View" action button (default: true) */
  showAction?: boolean;
  /** Callback when the "View" button is clicked */
  onAction?: () => void;

  /** If true, fills the gauge from right-to-left. Default: false */
  reverseFill?: boolean;

  /**
   * Render in "bare" mode — just the gauge arc, no WidgetCard wrapper.
   * Use this when embedding inside a parent card (e.g. EngineMonitorCard).
   */
  bare?: boolean;

  /** Height of the gauge container (default: 250px) */
  gaugeHeight?: number;

  /** Size variant — 'sm' renders a compact meter. Default: 'default' */
  size?: SpeedMeterSize;

  /** Extra Tailwind classes forwarded to WidgetCard (or outer div in bare mode) */
  className?: string;
}

// ─── Defaults ────────────────────────────────────────────────────────────────

const DEFAULT_FILL = '#00858D'; // blue
const DEFAULT_TRACK = '#9CA3AF'; // gray

const ARC_START = 220; // recharts angles — top-left start
const ARC_END = -40; // bottom-right end (260° sweep)

const SIZE_CONFIG = {
  lg: {
    innerR: 110,
    outerR: 135,
    cornerR: 50,
    gaugeHeight: 320,
    centerFontSize: '36px',
    tickScale: 'scale-[1.0]',
  },
  default: {
    innerR: 90,
    outerR: 110,
    cornerR: 40,
    gaugeHeight: 250,
    centerFontSize: '28px',
    tickScale: 'scale-[0.8]',
  },
  sm: {
    innerR: 55,
    outerR: 70,
    cornerR: 25,
    gaugeHeight: 160,
    centerFontSize: '18px',
    tickScale: 'scale-[0.55]',
  },
} as const;

// ─── Center label renderer ──────────────────────────────────────────────────

function CenterLabel({
  viewBox,
  label,
  fontSize = '28px',
}: {
  viewBox?: any;
  label: string;
  fontSize?: string;
}) {
  const { cx, cy } = viewBox ?? {};
  return (
    <text
      x={cx}
      y={cy}
      fill="currentColor"
      className="fill-foreground"
      textAnchor="middle"
      dominantBaseline="central"
    >
      <tspan alignmentBaseline="middle" fontSize={fontSize} fontWeight={700}>
        {label}
      </tspan>
    </text>
  );
}

// ─── Tick-mark overlay (SVG) ─────────────────────────────────────────────────
// Renders numbered ticks dynamically around the arc based on min/max values.

function DynamicTickSvg({
  scaleClass = 'scale-[0.8]',
  min = 0,
  max = 100,
  tickCount = 5,
}: {
  scaleClass?: string;
  min?: number;
  max?: number;
  tickCount?: number;
}) {
  // Arc geometry: 220° start → -40° end = 260° sweep (matching recharts PieChart)
  // In recharts angles: 220° is bottom-left, 90° is top, -40° is bottom-right
  // Convert to standard math angles for positioning
  const svgW = 211;
  const svgH = 163;
  const cx = svgW / 2;   // center X
  const cy = svgH * 0.67; // center Y (visually centered on the arc)
  const tickR = 80;       // radius for tick marks
  const labelR = 97;      // radius for labels (further out)
  const tickInner = 72;   // inner end of tick line

  // Generate tick angles: from ~220° (bottom-left) to ~-40°≡320° (bottom-right)
  // In standard math: 0° = right, 90° = up, 180° = left
  // Recharts 220° → standard math: 220° (measured from right, CCW)
  // We go from 220° down to -40° (=320°) in standard recharts terms
  // Mapping: arc goes from bottom-left (220°) CCW to bottom-right (320°)
  // In standard math coords: startAngle=220°, endAngle=320° going CW through top
  const sweepDeg = 260; // total arc sweep (220° to -40°)

  const ticks = [];
  for (let i = 0; i < tickCount; i++) {
    const frac = i / (tickCount - 1);
    // Arc goes CLOCKWISE from 220° (bottom-left) to -40°/320° (bottom-right)
    // So the angle decreases as frac increases
    const angleDeg = 220 - frac * sweepDeg;
    const angleRad = (angleDeg * Math.PI) / 180;

    // Tick mark endpoints
    const x1 = cx + tickInner * Math.cos(angleRad);
    const y1 = cy - tickInner * Math.sin(angleRad);
    const x2 = cx + tickR * Math.cos(angleRad);
    const y2 = cy - tickR * Math.sin(angleRad);

    // Label position
    const lx = cx + labelR * Math.cos(angleRad);
    const ly = cy - labelR * Math.sin(angleRad);

    const value = Math.round(min + frac * (max - min));

    ticks.push({ x1, y1, x2, y2, lx, ly, value });
  }

  // Also generate minor ticks (between major ticks)
  const minorTicks = [];
  const minorCount = (tickCount - 1) * 3; // 3 minor ticks between each major
  for (let i = 1; i < minorCount + tickCount - 1; i++) {
    const frac = i / (minorCount + tickCount - 1);
    // Skip positions that coincide with major ticks
    const isMajor = ticks.some((t) => {
      const majorFrac = (t.value - min) / (max - min);
      return Math.abs(frac - majorFrac) < 0.01;
    });
    if (isMajor) continue;

    const angleDeg = 220 - frac * sweepDeg;
    const angleRad = (angleDeg * Math.PI) / 180;
    const mTickInner = 75;
    const x1 = cx + mTickInner * Math.cos(angleRad);
    const y1 = cy - mTickInner * Math.sin(angleRad);
    const x2 = cx + tickR * Math.cos(angleRad);
    const y2 = cy - tickR * Math.sin(angleRad);
    minorTicks.push({ x1, y1, x2, y2 });
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={svgW}
      height={svgH}
      fill="none"
      className={`absolute left-1/2 top-1/2 -mt-4 -translate-x-1/2 -translate-y-1/2 ${scaleClass} transform`}
    >
      {/* Minor tick marks */}
      {minorTicks.map((t, i) => (
        <line
          key={`minor-${i}`}
          x1={t.x1}
          y1={t.y1}
          x2={t.x2}
          y2={t.y2}
          stroke="#929292"
          strokeWidth={1}
          strokeLinecap="round"
        />
      ))}
      {/* Major tick marks */}
      {ticks.map((t, i) => (
        <g key={`tick-${i}`}>
          <line
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke="#929292"
            strokeWidth={2}
            strokeLinecap="round"
          />
          <text
            x={t.lx}
            y={t.ly}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#929292"
            fontSize={11}
            fontWeight={500}
          >
            {t.value}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function SpeedMeter({
  title = 'ME PORT',
  value,
  max = 100,
  min = 0,
  centerLabel,
  segments,
  fillColor = DEFAULT_FILL,
  trackColor = DEFAULT_TRACK,
  showAction = true,
  onAction,
  bare = false,
  reverseFill = false,
  gaugeHeight: gaugeHeightProp,
  size = 'default',
  className,
}: SpeedMeterProps) {
  const sizeConfig = SIZE_CONFIG[size];
  const gaugeHeight = gaugeHeightProp ?? sizeConfig.gaugeHeight;
  // ── Derive display data ──────────────────────────────────────────────────

  const range = max - min;

  // Build the pie-chart data for the value arc
  const effectiveSegments: SpeedMeterSegment[] = segments
    ? segments
    : value !== undefined
      ? reverseFill
        ? [
            {
              name: 'remaining',
              value: Math.max(range - (value - min), 0),
              color: 'transparent',
            },
            {
              name: 'value',
              value: Math.min(Math.max(value - min, 0), range),
              color: fillColor,
            },
          ]
        : [
            {
              name: 'value',
              value: Math.min(Math.max(value - min, 0), range),
              color: fillColor,
            },
            {
              name: 'remaining',
              value: Math.max(range - (value - min), 0),
              color: 'transparent',
            },
          ]
      : [{ name: 'value', value: range, color: fillColor }];

  // The track (background) data is always 100 %
  const bgData = [{ name: 'track', value: 100 }];

  // Center text: explicit label → auto-derive from value
  const displayCenter =
    centerLabel !== undefined
      ? centerLabel
      : value !== undefined
        ? `${Math.round(((value - min) / range) * 100)}%`
        : '0%';

  // Segment colours — fall back to blue for any segment without a color
  const segmentColors = effectiveSegments.map((s) => s.color ?? fillColor);

  // ── Gauge inner content ────────────────────────────────────────────────

  const gaugeContent = (
    <>
      <div className={`relative w-full`} style={{ height: gaugeHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart className="[&_.recharts-layer:focus]:outline-none [&_.recharts-sector:focus]:outline-none dark:[&_.recharts-text.recharts-label]:first-of-type:fill-white">
            {/* Background track */}
            <Pie
              data={bgData}
              cornerRadius={sizeConfig.cornerR}
              innerRadius={sizeConfig.innerR}
              outerRadius={sizeConfig.outerR}
              fill={trackColor}
              stroke="rgba(0,0,0,0)"
              dataKey="value"
              startAngle={ARC_START}
              endAngle={ARC_END}
              isAnimationActive={false}
            >
              <Label
                width={30}
                position="center"
                content={
                  <CenterLabel
                    label={displayCenter}
                    fontSize={sizeConfig.centerFontSize}
                  />
                }
              />
            </Pie>

            {/* Value / segments arc */}
            <Pie
              data={effectiveSegments}
              cornerRadius={sizeConfig.cornerR}
              innerRadius={sizeConfig.innerR}
              outerRadius={sizeConfig.outerR}
              stroke="rgba(0,0,0,0)"
              dataKey="value"
              startAngle={ARC_START}
              endAngle={ARC_END}
              isAnimationActive={false}
            >
              {effectiveSegments.map((_, index) => (
                <Cell key={`cell-${index}`} fill={segmentColors[index]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Tick marks overlay */}
        <DynamicTickSvg scaleClass={sizeConfig.tickScale} min={min} max={max} />
      </div>

      {/* ── Legend / bottom info ────────────────────────────────────────── */}
      {segments && segments.length > 0 && (
        <div className="-mt-4 flex flex-wrap justify-center @lg:gap-8">
          {segments.map((seg: SpeedMeterSegment) => (
            <div key={seg.name}>
              <div className="flex items-center gap-1">
                <span
                  className="me-2 size-3 flex-shrink-0 rounded"
                  style={{ backgroundColor: seg.color ?? fillColor }}
                />
                <span className="whitespace-nowrap font-inter text-xl font-semibold text-gray-900 dark:text-gray-700">
                  {seg.value}%
                </span>
              </div>
              <p className="text-sm font-medium">{seg.name}</p>
            </div>
          ))}
        </div>
      )}
    </>
  );

  // ── Bare mode — no card wrapper ──────────────────────────────────────

  if (bare) {
    return <div className={className}>{gaugeContent}</div>;
  }

  // ── Card mode (default) ─────────────────────────────────────────────

  return (
    <WidgetCard
      title={title}
      titleClassName="font-inter"
      headerClassName="flex-wrap gap-4 items-center"
      actionClassName="ml-auto"
      className={className}
      action={
        showAction ? (
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer"
            onClick={onAction}
          >
            View
          </Button>
        ) : undefined
      }
    >
      <div className="mt-8">{gaugeContent}</div>
    </WidgetCard>
  );
}
