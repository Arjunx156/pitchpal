import { cn } from '../../lib/utils';

/** Shimmering placeholder — a broadcast "signal acquiring" bar. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md bg-surface-2',
        'before:absolute before:inset-0 before:-translate-x-full',
        'before:animate-[shimmer_1.6s_infinite] before:bg-gradient-to-r',
        'before:from-transparent before:via-[color-mix(in_oklab,var(--color-text)_10%,transparent)] before:to-transparent',
        className,
      )}
    />
  );
}
