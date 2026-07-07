import type { Variants } from 'framer-motion';

/**
 * Shared motion tokens so every animation across the app shares one rhythm
 * (duration/easing/spring). Honors reduced-motion via the app-level
 * <MotionConfig reducedMotion="user"> wrapper — no per-component guards needed.
 */
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/** Parent container that staggers its motion children into view. */
export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

/** A dashboard panel rising into place. */
export const panelItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 260, damping: 26 },
  },
};

/** A list row (standings, itinerary) — lighter than a panel. */
export const rowItem: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: EASE_OUT } },
};
