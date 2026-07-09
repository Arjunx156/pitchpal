import type { CSSProperties } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

/** Deterministic crest gradient per team code — no invented assets. */
export function crestStyle(code: string): CSSProperties {
  const a = ((code.charCodeAt(0) * 47) % 360 + 360) % 360;
  const b = (a + 40) % 360;
  return {
    background: `linear-gradient(135deg, oklch(58% 0.16 ${a}), oklch(40% 0.14 ${b}))`,
  };
}

export function Crest({ code, size = 'md' }: { code: string; size?: 'md' | 'lg' }) {
  const dimension = size === 'lg' ? 'h-14 w-14 text-xl sm:h-20 sm:w-20 sm:text-2xl' : 'h-10 w-10 text-base sm:h-14 sm:w-14 sm:text-xl';
  return (
    <span
      aria-hidden="true"
      style={crestStyle(code)}
      className={`grid shrink-0 place-items-center rounded-full border border-border-strong font-display leading-none text-white shadow-1 ${dimension}`}
    >
      {code.slice(0, 2)}
    </span>
  );
}

export function TeamBlock({
  code,
  name,
  align,
  size = 'md',
}: {
  code: string;
  name: string;
  align: 'start' | 'end';
  size?: 'md' | 'lg';
}) {
  const row = align === 'end' ? 'flex-row-reverse' : 'flex-row';
  const codeSize = size === 'lg' ? 'text-4xl sm:text-7xl' : 'text-3xl sm:text-6xl';
  return (
    <div className={`flex min-w-0 items-center gap-2 sm:gap-3 ${row} ${align === 'end' ? 'justify-start' : ''}`}>
      <Crest code={code} size={size} />
      <div className={`flex min-w-0 flex-col gap-1 ${align === 'end' ? 'items-end text-end' : 'items-start'}`}>
        <span className={`font-display leading-[0.85] tracking-wide text-foreground ${codeSize}`}>{code}</span>
        <span className="max-w-full truncate text-2xs font-semibold uppercase tracking-[0.12em] text-muted-foreground sm:text-xs">
          {name}
        </span>
      </div>
    </div>
  );
}

/** Score digit that pops when the value changes (goal!). Compositor-safe (transform/opacity only). */
export function ScoreDigit({ value, className = 'text-brand' }: { value: number; className?: string }) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={value}
        className={`inline-block ${className}`}
        initial={{ scale: 1.6, opacity: 0, y: -8 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.7, opacity: 0, y: 8 }}
        transition={{ type: 'spring', stiffness: 320, damping: 20 }}
      >
        {value}
      </motion.span>
    </AnimatePresence>
  );
}
