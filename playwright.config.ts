import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end smoke tests. Runs the real Vite dev server (which also serves the
 * mock `/api/chat` handler, so no Gemini key is needed) and drives Chromium.
 * Kept intentionally small and deterministic — critical first-load flows only.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    // Force mock mode even when a real key sits in .env: e2e must be
    // deterministic and must never spend the live Gemini quota.
    env: { ...process.env, GEMINI_API_KEY: '' },
  },
});
