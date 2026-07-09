import { motion } from 'framer-motion';

interface SparklineProps {
  data: number[];
  ariaLabel: string;
  area?: boolean;
  className?: string;
  /** Recolors the line/area/dot to a semantic congestion tone instead of the accent color. */
  tone?: 'ok' | 'busy' | 'jam';
}

const W = 120;
const H = 36;
const PAD = 3;

/** Tiny accessible line/area chart. Exposes a text summary via aria-label. */
export function Sparkline({ data, ariaLabel, area = false, className, tone }: SparklineProps) {
  if (data.length === 0) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = Math.max(1, max - min);
  const stepX = data.length > 1 ? (W - 2 * PAD) / (data.length - 1) : 0;

  const points = data.map((v, i) => {
    const x = PAD + i * stepX;
    const y = H - PAD - ((v - min) / range) * (H - 2 * PAD);
    return { x, y };
  });
  const line = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const last = points[points.length - 1];

  return (
    <svg
      className={`spark${tone ? ` spark--${tone}` : ''}${className ? ` ${className}` : ''}`}
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={ariaLabel}
      preserveAspectRatio="none"
    >
      {area ? (
        <motion.polygon
          className="spark__area"
          points={`${PAD},${H} ${line} ${W - PAD},${H}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        />
      ) : null}
      <motion.polyline
        className="spark__line"
        points={line}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      />
      {last ? (
        <motion.circle
          className="spark__dot"
          cx={last.x}
          cy={last.y}
          r={2.6}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.7, type: 'spring', stiffness: 400, damping: 20 }}
        />
      ) : null}
    </svg>
  );
}
