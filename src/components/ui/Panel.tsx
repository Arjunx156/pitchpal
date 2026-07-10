import { forwardRef, type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { panelItem } from '../../lib/motion';
import { cn } from '../../lib/utils';

/**
 * A broadcast surface. `glass` floats (lower-third material); solid is for
 * dense data. An optional eyebrow + heading renders the standard broadcast
 * caption row so every panel reads as part of one graphics package.
 */
interface PanelProps extends Omit<HTMLMotionProps<'section'>, 'title'> {
  /** Small mono uppercase caption above the heading (broadcast eyebrow). */
  eyebrow?: ReactNode;
  heading?: ReactNode;
  /** Right-aligned control/status in the caption row. */
  action?: ReactNode;
  surface?: 'glass' | 'solid';
  /** Opt out of the rise-in entrance (e.g. when the parent already staggers). */
  animate?: boolean;
  children?: ReactNode;
}

export const Panel = forwardRef<HTMLElement, PanelProps>(function Panel(
  { eyebrow, heading, action, surface = 'glass', animate = true, className, children, ...props },
  ref,
) {
  const hasCaption = eyebrow || heading || action;
  return (
    <motion.section
      ref={ref}
      variants={animate ? panelItem : undefined}
      className={cn(
        surface === 'glass' ? 'glass' : 'panel',
        'rounded-lg p-4 sm:p-5',
        surface === 'glass' && 'rounded-lg',
        className,
      )}
      {...props}
    >
      {hasCaption ? (
        <header className="mb-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            {eyebrow ? <p className="hud-eyebrow">{eyebrow}</p> : null}
            {heading ? (
              <h2 className="display mt-0.5 truncate text-lg text-foreground">{heading}</h2>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </header>
      ) : null}
      {children}
    </motion.section>
  );
});
