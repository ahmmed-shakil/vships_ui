'use client';

import PerfomaxCard from '@/components/cards/perfomax-card';
import { CustomTooltip } from '@/components/charts/custom-tooltip';
import { coolantPressureData } from '@/data/nura/condition-monitoring-chart-data';
import cn from '@/utils/class-names';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

/** Custom X-axis tick — date on top, time on bottom */
function DateTimeTick({ x, y, payload }: any) {
  const parts = (payload.value as string).split('\n');
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={10} textAnchor="middle" fontSize={8} fill="#9FA6B5">
        {parts[0]}
      </text>
      <text x={0} y={0} dy={20} textAnchor="middle" fontSize={8} fill="#9FA6B5">
        {parts[1] ?? ''}
      </text>
    </g>
  );
}

// Color constants matching the screenshot but optimized for dark theme
const COLORS = {
  withinRange: '#3B82F6', // Blue for within limits (0.5 to upper)
  outOfRange: '#EF4444', // Red for outside limits
  grid: 'rgba(75, 85, 99, 0.2)', // Subtle grid
};

/**
 * Fuel Consumption - ME Port Status
 *
 * Line chart with temperature line that changes color based on thresholds using an SVG gradient.
 * - White: within limits
 * - Red: >= upper limit
 * - Light Blue: <= lower limit
 */
export default function CoolantPressureChart({
  className,
}: {
  className?: string;
}) {
  // Constants for thresholds as defined in data
  const upperLimit = 5.0;
  const lowerLimit = 0.5;

  // We set the YAxis domain explicitly
  const domainMin = 0;
  const domainMax = 6;

  // Calculate min and max from the actual data to ensure gradient offsets are accurate
  // relative to the line's bounding box (which is what Recharts uses by default for gradients)
  const temperatures = coolantPressureData.map((d) => d.temperature);
  const dataMin = Math.min(...temperatures);
  const dataMax = Math.max(...temperatures);

  // Recharts gradient offsets are relative to the bounding box of the SVG path.
  // The path's Y extent is [dataMin, dataMax].
  // Note: linearGradient with y1=1 y2=0 means bottom up.
  const lowerOffset = ((lowerLimit - dataMin) / (dataMax - dataMin)) * 100;
  const upperOffset = ((upperLimit - dataMin) / (dataMax - dataMin)) * 100;

  return (
    <PerfomaxCard
      title="Fuel Consumption"
      className={cn('flex flex-col', className)}
      bodyClassName="flex-1"
      action={
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block h-0.5 w-4"
              style={{ backgroundColor: '#3B82F6' }}
            />
            Within Range
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block h-0.5 w-4"
              style={{ backgroundColor: '#EF4444' }}
            />
            Out of Range
          </span>
        </div>
      }
    >
      <div className="h-full min-h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={coolantPressureData}
            margin={{ top: 10, right: 30, left: -20, bottom: 20 }}
          >
            <defs>
              <linearGradient id="colorTemperature" x1="0" y1="1" x2="0" y2="0">
                {/* 0% to lowerOffset% -> Below Lower Limit (Red - out of range) */}
                <stop offset="0%" stopColor={COLORS.outOfRange} />
                <stop
                  offset={`${lowerOffset}%`}
                  stopColor={COLORS.outOfRange}
                />

                {/* Sudden change at lower limit to Blue for within range */}
                <stop
                  offset={`${lowerOffset}%`}
                  stopColor={COLORS.withinRange}
                />
                <stop
                  offset={`${upperOffset}%`}
                  stopColor={COLORS.withinRange}
                />

                {/* Sudden change at upper limit to Red (out of range) */}
                <stop
                  offset={`${upperOffset}%`}
                  stopColor={COLORS.outOfRange}
                />
                <stop offset="100%" stopColor={COLORS.outOfRange} />
              </linearGradient>
            </defs>

            <CartesianGrid
              vertical={false}
              stroke={COLORS.grid}
              strokeDasharray="3 3"
            />

            <XAxis
              dataKey="date"
              tick={<DateTimeTick />}
              interval={0}
              height={40}
              axisLine={{ stroke: '#374151' }}
              tickLine={false}
              padding={{ left: 10, right: 10 }}
            />

            <YAxis
              tick={{ fontSize: 10, fill: '#9FA6B5' }}
              domain={[domainMin, domainMax]}
              tickCount={7}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Red background bands for out-of-range areas */}
            <ReferenceArea
              y1={upperLimit}
              y2={domainMax}
              fill="#EF4444"
              fillOpacity={0.15}
            />
            <ReferenceArea
              y1={domainMin}
              y2={lowerLimit}
              fill="#EF4444"
              fillOpacity={0.15}
            />

            {/* Reference Dividers for limits */}
            <ReferenceArea
              y1={upperLimit}
              y2={upperLimit + 0.02}
              className="fill-gray-700 dark:fill-gray-300"
              fillOpacity={0.8}
            />
            <ReferenceArea
              y1={lowerLimit}
              y2={lowerLimit + 0.02}
              className="fill-gray-700 dark:fill-gray-300"
              fillOpacity={0.8}
            />

            {/* Main Temperature Line */}
            <Line
              type="monotone"
              dataKey="temperature"
              name="Temperature"
              stroke="url(#colorTemperature)"
              strokeWidth={3}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </PerfomaxCard>
  );
}
