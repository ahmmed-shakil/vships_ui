'use client';

import PerfomaxCard from '@/components/cards/perfomax-card';
import { CustomTooltip } from '@/components/charts/custom-tooltip';
import { getCoolantPressureChartData } from '@/actions/condition-monitoring-actions';
import cn from '@/utils/class-names';
import { useEffect, useState } from 'react';
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
  withinRange: '#3B82F6', // Blue for within limits
  outOfRange: '#EF4444', // Red for outside limits
  grid: 'rgba(75, 85, 99, 0.2)', // Subtle grid
};

export default function CoolantPressureChart({
  className,
}: {
  className?: string;
}) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const result = await getCoolantPressureChartData();
        setData(result);
      } catch (err) {
        console.error('Error fetching chart data', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Calculate bounds or use defaults
  const upperLimit = data.length > 0 ? data[0].upperLimit : 60;
  const lowerLimit = data.length > 0 ? data[0].lowerLimit : 0;
 
  const fuelConsRates = data.map((d) => d.fuelConsRate);
  const dataMin = fuelConsRates.length ? Math.min(...fuelConsRates) : 0;
  const dataMax = fuelConsRates.length ? Math.max(...fuelConsRates) : 100;
 
  // Add padding to the domain
  const domainMin = Math.min(0, dataMin - 5);
  const domainMax = Math.max(upperLimit + 10, dataMax + 5);
 
  // Gradient offset calculation
  const rangeSpan = domainMax - domainMin;
  const lowerOffset = rangeSpan > 0 ? ((lowerLimit - domainMin) / rangeSpan) * 100 : 0;
  const upperOffset = rangeSpan > 0 ? ((upperLimit - domainMin) / rangeSpan) * 100 : 80;

  // Helper to format values to max 2 decimal places without trailing zeros
  const formatVal = (v: number) => Number(v.toFixed(2)).toString();

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
      <div className="flex h-full min-h-[250px] w-full pb-2 pl-2 pt-2 relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm">
            <span className="text-sm font-medium text-muted-foreground animate-pulse">Loading CSV Data...</span>
          </div>
        )}

        {/* Y-axis label */}
        <div className="flex flex-col items-center justify-center gap-1 pr-1">
          <span
            className="text-[10px] font-medium text-muted-foreground"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            Fuel Cons. Rate (L/H)
          </span>
        </div>

        <div className="flex flex-1 flex-col">
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 10, right: 30, left: -15, bottom: 5 }}
              >
                <defs>
                  <linearGradient
                    id="colorFuelCons"
                    x1="0"
                    y1="1"
                    x2="0"
                    y2="0"
                  >
                    <stop offset="0%" stopColor={COLORS.outOfRange} />
                    <stop offset={`${Math.max(0, lowerOffset)}%`} stopColor={COLORS.outOfRange} />
                    <stop offset={`${Math.max(0, lowerOffset)}%`} stopColor={COLORS.withinRange} />
                    <stop offset={`${Math.min(100, upperOffset)}%`} stopColor={COLORS.withinRange} />
                    <stop offset={`${Math.min(100, upperOffset)}%`} stopColor={COLORS.outOfRange} />
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
                  interval={Math.max(0, Math.floor(data.length / 8))}
                  height={30}
                  axisLine={{ stroke: '#374151' }}
                  tickLine={false}
                  padding={{ left: 10, right: 10 }}
                />

                <YAxis
                  tick={{ fontSize: 10, fill: '#9FA6B5' }}
                  domain={[Math.floor(domainMin), Math.ceil(domainMax)]}
                  tickCount={7}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatVal}
                />

                <Tooltip 
                  content={<CustomTooltip />} 
                  formatter={(value: any) => [formatVal(Number(value)), 'Fuel Cons Rate']}
                />

                {/* Red background bands for out-of-range areas */}
                <ReferenceArea
                  y1={upperLimit}
                  y2={Math.ceil(domainMax)}
                  fill="#EF4444"
                  fillOpacity={0.15}
                />
                <ReferenceArea
                  y1={Math.floor(domainMin)}
                  y2={lowerLimit}
                  fill="#EF4444"
                  fillOpacity={0.15}
                />

                {/* Reference Dividers for limits */}
                <ReferenceArea
                  y1={upperLimit}
                  y2={upperLimit + (domainMax - domainMin) * 0.005} 
                  className="fill-gray-700 dark:fill-gray-300"
                  fillOpacity={0.8}
                />
                <ReferenceArea
                  y1={lowerLimit}
                  y2={lowerLimit + (domainMax - domainMin) * 0.005}
                  className="fill-gray-700 dark:fill-gray-300"
                  fillOpacity={0.8}
                />

                {/* Main Data Line */}
                <Line
                  type="monotone"
                  dataKey="fuelConsRate"
                  name="fuelConsRate"
                  stroke="url(#colorFuelCons)"
                  strokeWidth={3}
                  dot={false}
                  isAnimationActive={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* X-axis label */}
          <div className="mt-1 flex items-center justify-center">
            <span className="text-[10px] font-medium text-muted-foreground">
              Date / Time
            </span>
          </div>
        </div>
      </div>
    </PerfomaxCard>
  );
}
