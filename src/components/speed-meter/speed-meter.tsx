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
// Renders numbered ticks around the arc. The SVG is 211×163 to match the
// original design template.

function TickSvg({ scaleClass = 'scale-[0.8]' }: { scaleClass?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={211}
      height={163}
      fill="none"
      className={`absolute left-1/2 top-1/2 -mt-4 -translate-x-1/2 -translate-y-1/2 ${scaleClass} transform`}
    >
      <path
        stroke="#929292"
        strokeLinecap="round"
        strokeWidth={2}
        d="M107.207 1.426v12.132m76.104 20.725-3.314 3.314M14.504 55.259l9.039 5.218m29.98-44.239 2.343 4.058M1.324 109.514h4.412m-4.412 0h4.412m.323 27.742 4.526-1.213M79.234 5.588l1.213 4.526m80.785 7.226-2.343 4.059M4.957 82.072l4.526 1.213M136.625 5.588l-1.213 4.526m63.736 46.247-9.038 5.219M31.445 33.18l3.314 3.314m152.042 119.048 9.038 5.218m9.528-51.246h4.412m-6.752-25.844 4.527-1.212m-5.63 52.097 4.526 1.212M23.543 156.646l-9.04 5.218"
      />
      <path
        fill="#929292"
        d="M37.186 154.747c-.673-.002-1.248-.18-1.725-.532-.478-.353-.843-.865-1.096-1.539-.252-.673-.379-1.484-.379-2.433 0-.946.127-1.754.38-2.425.255-.67.622-1.181 1.099-1.534.48-.352 1.054-.528 1.721-.528.668 0 1.24.178 1.718.533.477.352.842.863 1.095 1.534.256.667.383 1.474.383 2.42 0 .952-.126 1.764-.379 2.438-.253.67-.618 1.183-1.095 1.538-.477.352-1.051.528-1.722.528Zm0-1.137c.591 0 1.053-.289 1.385-.865.336-.577.503-1.411.503-2.502 0-.724-.076-1.336-.23-1.836-.15-.503-.368-.884-.652-1.143a1.428 1.428 0 0 0-1.006-.392c-.588 0-1.05.29-1.385.87-.335.579-.504 1.413-.507 2.501 0 .727.076 1.342.226 1.845.154.5.371.88.652 1.138.282.256.62.384 1.014.384ZM25.324 74.088v-.955l2.953-3.06c.315-.332.575-.623.78-.873.207-.253.362-.493.464-.72.103-.227.154-.469.154-.725 0-.29-.069-.54-.205-.75a1.338 1.338 0 0 0-.558-.49 1.776 1.776 0 0 0-.797-.174c-.312 0-.585.064-.818.192a1.313 1.313 0 0 0-.537.54 1.705 1.705 0 0 0-.188.819h-1.257c0-.531.122-.996.367-1.394a2.49 2.49 0 0 1 1.006-.924c.426-.222.91-.333 1.453-.333.548 0 1.03.11 1.449.328.42.216.748.512.984.887.236.372.354.792.354 1.261 0 .324-.062.64-.184.95-.119.31-.328.655-.626 1.036-.298.378-.713.837-1.244 1.376l-1.735 1.816v.064h3.93v1.129h-5.745Zm10.24.12a3.287 3.287 0 0 1-1.44-.308 2.617 2.617 0 0 1-1.015-.852 2.25 2.25 0 0 1-.404-1.236h1.278c.031.375.197.684.498.925.302.242.663.362 1.083.362.335 0 .632-.077.89-.23a1.65 1.65 0 0 0 .614-.643c.15-.273.226-.584.226-.934 0-.355-.077-.671-.23-.95a1.698 1.698 0 0 0-.635-.656 1.793 1.793 0 0 0-.92-.243c-.265 0-.53.046-.797.136-.267.091-.483.21-.648.358l-1.206-.179.49-4.397h4.798v1.129h-3.703l-.277 2.442h.051c.17-.165.397-.303.678-.414.284-.11.588-.166.912-.166a2.671 2.671 0 0 1 2.403 1.415c.242.434.361.934.358 1.5a2.917 2.917 0 0 1-.383 1.513 2.781 2.781 0 0 1-1.066 1.048c-.451.253-.97.38-1.555.38Zm67.769-44.118a3.293 3.293 0 0 1-1.441-.307 2.62 2.62 0 0 1-1.014-.852 2.249 2.249 0 0 1-.405-1.236h1.279c.031.375.197.683.498.925a1.68 1.68 0 0 0 1.083.362c.335 0 .632-.077.89-.23a1.65 1.65 0 0 0 .614-.643c.151-.273.226-.584.226-.934a1.94 1.94 0 0 0-.23-.95 1.703 1.703 0 0 0-.635-.656 1.795 1.795 0 0 0-.921-.243c-.264 0-.529.045-.797.136a1.85 1.85 0 0 0-.647.358l-1.206-.179.49-4.398h4.798v1.13h-3.703l-.277 2.441h.051a2.05 2.05 0 0 1 .678-.413c.284-.11.588-.166.912-.166a2.672 2.672 0 0 1 2.403 1.415c.242.434.361.934.358 1.5a2.92 2.92 0 0 1-.383 1.513 2.779 2.779 0 0 1-1.066 1.048c-.452.253-.97.379-1.555.379Zm7.599.026c-.673-.003-1.249-.18-1.726-.533-.477-.352-.842-.865-1.095-1.538-.253-.674-.379-1.485-.379-2.434 0-.946.126-1.754.379-2.424.255-.67.622-1.182 1.099-1.535.48-.352 1.054-.528 1.722-.528.667 0 1.24.178 1.717.533.477.352.842.863 1.095 1.534.256.668.384 1.474.384 2.42 0 .952-.127 1.764-.379 2.438-.253.67-.618 1.183-1.096 1.538-.477.352-1.051.529-1.721.529Zm0-1.138c.591 0 1.052-.289 1.385-.865.335-.577.503-1.41.503-2.502 0-.724-.077-1.336-.23-1.836-.151-.503-.368-.884-.652-1.142a1.43 1.43 0 0 0-1.006-.392c-.588 0-1.05.29-1.385.869-.335.58-.504 1.413-.507 2.501 0 .728.075 1.343.226 1.845.153.5.37.88.652 1.138.281.256.619.384 1.014.384Zm62.546 45.11 3.81-7.534v-.064h-4.406v-1.13h5.77v1.168l-3.797 7.56h-1.377Zm9.419.12a3.286 3.286 0 0 1-1.44-.308 2.606 2.606 0 0 1-1.014-.852 2.249 2.249 0 0 1-.405-1.236h1.278c.031.375.198.684.499.925.301.242.662.362 1.082.362.335 0 .632-.077.891-.23.261-.156.466-.37.613-.643.151-.273.226-.584.226-.934a1.93 1.93 0 0 0-.23-.95 1.695 1.695 0 0 0-.635-.656 1.793 1.793 0 0 0-.92-.243c-.265 0-.53.046-.797.136-.267.091-.483.21-.648.358l-1.206-.179.49-4.397h4.798v1.129h-3.703l-.277 2.442h.052a2.03 2.03 0 0 1 .677-.414c.284-.11.588-.166.912-.166a2.672 2.672 0 0 1 2.403 1.415c.242.434.361.934.358 1.5a2.92 2.92 0 0 1-.383 1.513 2.778 2.778 0 0 1-1.066 1.048c-.451.253-.97.38-1.555.38ZM167.4 142.567v8.727h-1.321v-7.406h-.052l-2.088 1.363v-1.261l2.178-1.423h1.283Zm5.399 8.872c-.673-.003-1.249-.181-1.726-.533-.477-.352-.842-.865-1.095-1.538s-.379-1.485-.379-2.433c0-.946.126-1.755.379-2.425.255-.671.622-1.182 1.099-1.534.48-.353 1.054-.529 1.722-.529.667 0 1.24.178 1.717.533.477.352.842.864 1.095 1.534.256.668.384 1.475.384 2.421 0 .951-.127 1.764-.379 2.437-.253.671-.618 1.183-1.096 1.538-.477.353-1.051.529-1.721.529Zm0-1.138c.591 0 1.052-.288 1.385-.865.335-.577.503-1.411.503-2.501 0-.725-.077-1.337-.231-1.837-.15-.503-.367-.884-.652-1.142a1.426 1.426 0 0 0-1.005-.392c-.588 0-1.05.29-1.385.869-.335.58-.504 1.414-.507 2.502 0 .727.075 1.342.226 1.845.153.5.37.879.652 1.138.281.255.619.383 1.014.383Zm7.746 1.138c-.673-.003-1.249-.181-1.726-.533-.477-.352-.842-.865-1.095-1.538s-.379-1.485-.379-2.433 0-.946.126-1.755.379-2.425c.256-.671.622-1.182 1.099-1.534.48-.353 1.054-.529 1.722-.529.668 0 1.24.178 1.717.533.477.352.843.864 1.095 1.534.256.668.384 1.475.384 2.421 0 .951-.127 1.764-.379 2.437-.253.671-.618 1.183-1.096 1.538-.477.353-1.051.529-1.721.529Zm0-1.138c.591 0 1.052-.288 1.385-.865.335-.577.503-1.411.503-2.501 0-.725-.077-1.337-.23-1.837-.151-.503-.368-.884-.652-1.142a1.43 1.43 0 0 0-1.006-.392c-.588 0-1.05.29-1.385.869-.335.58-.504 1.414-.507 2.502 0 .727.075 1.342.226 1.845.153.5.37.879.652 1.138.281.255.619.383 1.014.383Z"
      />
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
        <TickSvg scaleClass={sizeConfig.tickScale} />
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
