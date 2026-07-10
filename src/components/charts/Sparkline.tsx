import { useId } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface SparklineProps {
  values: number[];
  /** CSS color (token var) for the line + fill. */
  color?: string;
  width?: number;
  height?: number;
  className?: string;
}

/**
 * A tiny broadcast trend line — self-drawing on mount, with a soft area fill.
 * Pure SVG; only `pathLength` animates, so it stays compositor-cheap.
 */
export function Sparkline({
  values,
  color = 'var(--color-accent)',
  width = 96,
  height = 30,
  className,
}: SparklineProps) {
  const id = useId().replace(/:/g, '');
  const max = Math.max(1, ...values);
  const min = Math.min(0, ...values);
  const span = max - min || 1;
  const step = values.length > 1 ? width / (values.length - 1) : width;

  const points = values.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / span) * (height - 4) - 2;
    return [x, y] as const;
  });

  const line = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${line} L${width},${height} L0,${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={cn('overflow-visible', className)}
      aria-hidden
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#spark-${id})`} />
      <motion.path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      />
      {points.length > 0 ? (
        <circle cx={points[points.length - 1]![0]} cy={points[points.length - 1]![1]} r={2.6} fill={color} />
      ) : null}
    </svg>
  );
}
