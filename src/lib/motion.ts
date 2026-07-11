import type { Transition, Variants } from 'framer-motion';

/**
 * Broadcast motion system. One rhythm for the whole graphics package so
 * reveals, stingers and flips share a signature. Reduced-motion is honored
 * globally via <MotionConfig reducedMotion="user">, so no per-component guards.
 */

export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
export const EASE_EMPHASIZED = [0.2, 0, 0, 1] as const;

/** Broadcast "slam" spring — punchy, slightly overshooting, like a stinger. */
export const SPRING_STINGER: Transition = {
  type: 'spring',
  stiffness: 520,
  damping: 30,
  mass: 0.9,
};
/** Calmer spring for panels rising into place. */
export const SPRING_PANEL: Transition = { type: 'spring', stiffness: 260, damping: 26 };

/** Parent that staggers children in — the HUD "booting up". */
export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

/** A panel rising into place. */
export const panelItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: SPRING_PANEL },
};

/** A list row — lighter than a panel. */
export const rowItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE_OUT } },
};

/** Lower-third stinger: slides + scales in from the left like a broadcast bar. */
export const stingerIn: Variants = {
  hidden: { opacity: 0, x: -28, skewX: '-6deg' },
  show: { opacity: 1, x: 0, skewX: '0deg', transition: SPRING_STINGER },
  exit: { opacity: 0, x: 20, transition: { duration: 0.2, ease: EASE_OUT } },
};

/** A moment "slams" in vertically — used when a goal/card drops on the ticker. */
export const momentSlam: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: SPRING_STINGER },
  exit: { opacity: 0, y: -12, transition: { duration: 0.18, ease: EASE_OUT } },
};

/** Score digit flip — top-hinged, like a split-flap board. */
export const digitFlip: Variants = {
  hidden: { rotateX: -90, opacity: 0, y: '-40%' },
  show: {
    rotateX: 0,
    opacity: 1,
    y: '0%',
    transition: { type: 'spring', stiffness: 420, damping: 26 },
  },
  exit: { rotateX: 90, opacity: 0, y: '40%', transition: { duration: 0.18, ease: EASE_OUT } },
};

/** Simple fade for overlays/scrims. */
export const overlayIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.22, ease: EASE_OUT } },
  exit: { opacity: 0, transition: { duration: 0.16 } },
};

/** Modal/dialog content entrance. */
export const dialogIn: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 340, damping: 30 } },
  exit: { opacity: 0, y: 12, scale: 0.98, transition: { duration: 0.16, ease: EASE_OUT } },
};
