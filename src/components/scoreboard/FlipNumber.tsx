import { AnimatePresence, motion } from 'framer-motion';
import { digitFlip } from '../../lib/motion';
import { cn } from '../../lib/utils';

/**
 * Split-flap number. Each digit sits in a fixed-width cell and flips on a
 * top-hinge when its value changes — the scoreboard "ticks over" like a real
 * broadcast board. Under reduced-motion the flip collapses to an instant swap.
 */
function FlipDigit({ char }: { char: string }) {
  return (
    <span
      className="relative inline-grid overflow-hidden text-center [perspective:420px]"
      style={{ width: '0.62em' }}
    >
      {/* reserve height */}
      <span className="invisible col-start-1 row-start-1" aria-hidden>
        {char === ':' ? ':' : '0'}
      </span>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={char}
          variants={digitFlip}
          initial="hidden"
          animate="show"
          exit="exit"
          className="col-start-1 row-start-1 [transform-origin:center_top] [backface-visibility:hidden]"
        >
          {char}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function FlipNumber({
  value,
  className,
  ariaLabel,
}: {
  value: number | string;
  className?: string;
  ariaLabel?: string;
}) {
  const chars = String(value).split('');
  return (
    <span className={cn('tabular inline-flex', className)} aria-label={ariaLabel} role="text">
      {chars.map((c, i) => (
        <FlipDigit key={`${i}-${c}`} char={c} />
      ))}
    </span>
  );
}
