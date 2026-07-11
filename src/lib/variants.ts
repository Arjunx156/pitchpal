/**
 * Shared Tailwind class fragments for recurring surface treatments, so the
 * accent `color-mix(…)` values live in one place instead of being copy-pasted
 * (with slightly different opacities) across a dozen components. Compose with
 * `cn()` and add per-instance sizing/layout classes at the call site.
 */

/** Text input / select on a translucent surface with an accent focus ring. */
export const FIELD_SURFACE =
  'rounded-lg border border-border bg-[color-mix(in_oklab,var(--color-surface)_60%,transparent)] text-sm text-foreground focus:border-[color-mix(in_oklab,var(--color-accent)_60%,transparent)] focus:outline-none';

/** Small pill button with an accent outline that tints on hover. */
export const ACCENT_PILL =
  'inline-flex items-center rounded-full border border-[color-mix(in_oklab,var(--color-accent)_35%,transparent)] font-semibold text-accent hover:bg-[color-mix(in_oklab,var(--color-accent)_12%,transparent)]';
