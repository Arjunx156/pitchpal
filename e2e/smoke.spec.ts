import { test, expect } from '@playwright/test';

test.describe('PitchPal smoke', () => {
  test('loads with the correct title and the onboarding dialog', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/PitchPal/);
    await expect(page.getByRole('heading', { name: 'Welcome to PitchPal' })).toBeVisible();
  });

  test('skipping onboarding reveals the match-day dashboard', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Skip' }).click();
    await expect(page.getByRole('heading', { name: 'Welcome to PitchPal' })).toBeHidden();
    await expect(page.getByText('Quick help')).toBeVisible();
  });

  test('choosing a language localizes the interface', async ({ page }) => {
    await page.goto('/');
    // Selecting Español in onboarding re-renders the chrome in Spanish (Skip → Omitir).
    await page.getByRole('button', { name: 'Español' }).click();
    await expect(page.getByRole('button', { name: 'Omitir' })).toBeVisible();
  });
});
