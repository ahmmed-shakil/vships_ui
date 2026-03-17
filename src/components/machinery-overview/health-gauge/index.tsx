'use client';

interface HealthGaugeProps {
  value: number; // 0-100 percentage
  size?: number; // overall width of the gauge, default 64
  color?: string; // arc fill color, default '#e8862a'
  className?: string;
}

export default function HealthGauge({
  value,
  size = 64,
  color = '#e8862a',
  className,
}: HealthGaugeProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  // Fixed viewBox: 100 wide, 56 tall
  const vbW = 100;
  const vbH = 56;
  const sw = 10;
  const r = 40;
  const cx = 50;
  const cy = 52;

  // Single semicircle path (left → right, clockwise)
  // Both arcs will use this EXACT same path so they share the same centre.
  const d = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;

  // Arc length of the semicircle = π * r
  const arcLen = Math.PI * r;
  // How much of the arc to fill with the value colour
  const valueDash = (clampedValue / 100) * arcLen;

  const height = (vbH / vbW) * size;

  return (
    <div
      className={className}
      style={{
        width: size,
        height,
        position: 'relative',
        flexShrink: 0,
      }}
    >
      <svg
        width={size}
        height={height}
        viewBox={`0 0 ${vbW} ${vbH}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* background track — full semicircle, grey */}
        <path
          d={d}
          fill="none"
          stroke="#d1d5db"
          strokeWidth={sw}
          strokeLinecap="round"
        />
        {/* value arc — same path, clipped via dasharray */}
        {clampedValue > 0 && (
          <path
            d={d}
            fill="none"
            stroke={color}
            strokeWidth={sw}
            strokeLinecap="round"
            strokeDasharray={`${valueDash} ${arcLen}`}
          />
        )}
      </svg>
      {/* percentage label */}
      <span
        style={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          fontWeight: 700,
          fontSize: size * 0.22,
          color: 'currentColor',
          lineHeight: 1,
        }}
      >
        {clampedValue}%
      </span>
    </div>
  );
}
