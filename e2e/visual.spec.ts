import { test, expect } from '@playwright/test';

/**
 * Visual-regression matrix: {home, chat, map} × {375, 768, 1440} × {dark, light}.
 *
 * Opt-in because screenshot baselines are OS-specific (fonts/AA differ across
 * Windows/Linux/macOS). Generate or refresh baselines on the OS you compare on:
 *
 *   VISUAL=1 npx playwright test e2e/visual.spec.ts --update-snapshots
 *
 * then run with VISUAL=1 to compare. The virtual match clock is frozen so the
 * scoreboard (clock, countdown, moments) renders identically on every run.
 */
test.skip(!process.env.VISUAL, 'opt-in: set VISUAL=1 (screenshot baselines are per-OS)');

// Windows Chromium occasionally rasters the whole viewport with a sub-pixel
// offset; one retry absorbs that jitter without masking real regressions.
test.describe.configure({ retries: 1 });

const SURFACES = ['home', 'chat', 'map'] as const;
const WIDTHS = [375, 768, 1440];
const SCHEMES = ['dark', 'light'] as const;
const FROZEN_TIME = new Date('2026-06-14T18:00:00');

for (const scheme of SCHEMES) {
  for (const width of WIDTHS) {
    for (const surface of SURFACES) {
      test(`${surface} @ ${width}px ${scheme}`, async ({ page }) => {
        // Fixed (not just faked) time: Date.now() never advances, so the
        // scoreboard clock/countdown renders identically on every capture.
        await page.clock.setFixedTime(FROZEN_TIME);
        await page.addInitScript(() => {
          window.localStorage.setItem('pitchpal.onboarded', '1');
        });
        await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' });
        await page.setViewportSize({ width, height: 900 });

        await page.goto(`/#${surface}`);
        await page.waitForLoadState('networkidle');
        await page.evaluate(() => document.fonts.ready);
        // The scoreboard slides in via a framer spring (y: -10 → 0); wait for
        // it to settle at identity so no capture races the entrance.
        await page.waitForFunction(() => {
          const el = document.querySelector('section.scanlines');
          if (!el) return false;
          const t = getComputedStyle(el).transform;
          return t === 'none' || t === 'matrix(1, 0, 0, 1, 0, 0)';
        });
        await page.waitForTimeout(250);
        // Pin the capture origin: no stray sub-pixel scroll or hover state.
        await page.mouse.move(0, 0);
        await page.evaluate(() => window.scrollTo(0, 0));

        // Viewport capture (not fullPage): stitching a scrolled page moves the
        // position:fixed bottom nav between tiles and flakes the comparison.
        await expect(page).toHaveScreenshot(`${surface}-${width}-${scheme}.png`, {
          animations: 'disabled',
          maxDiffPixels: 100,
        });
      });
    }
  }
}
