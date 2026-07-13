import { test, expect, type Page } from '@playwright/test';

/** Mark first-run onboarding as done before the app boots. */
async function skipOnboarding(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem('pitchpal.onboarded', '1');
  });
}

test.describe('chat', () => {
  test.beforeEach(async ({ page }) => skipOnboarding(page));

  test('quick action streams a demo answer into the chat surface', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Find my seat' }).first().click();

    // The ask navigates to the chat surface (hash-backed).
    await expect(page).toHaveURL(/#chat$/);
    // The user bubble and the mode badge appear…
    await expect(page.getByText('How do I get to my seat?')).toBeVisible();
    await expect(page.getByText('Demo mode', { exact: true })).toBeVisible();
    // …and the composer becomes sendable again once the stream finishes.
    await expect(page.getByRole('button', { name: 'Send' })).toBeVisible({ timeout: 15_000 });
  });

  test('answers on-device with an offline badge when the network drops', async ({
    page,
    context,
  }) => {
    await page.goto('/#chat');
    await expect(
      page.getByPlaceholder('Ask about seats, food, access, or transport…'),
    ).toBeVisible();

    await context.setOffline(true);
    // Connectivity loss surfaces immediately, before any send.
    await expect(page.getByText('Offline', { exact: true })).toBeVisible();

    await page
      .getByPlaceholder('Ask about seats, food, access, or transport…')
      .fill("Where's the nearest food?");
    await page.getByRole('button', { name: 'Send' }).click();

    await expect(page.getByText("Where's the nearest food?")).toBeVisible();
    // The deterministic on-device engine still answers.
    await expect(page.locator('.glass p').filter({ hasText: /./ }).first()).toBeVisible();
    await context.setOffline(false);
  });
});

test.describe('surfaces in the URL', () => {
  test.beforeEach(async ({ page }) => skipOnboarding(page));

  test('deep link opens the map, back button returns home', async ({ page }) => {
    await page.goto('/#map');
    await expect(page.getByText('Stadium map').first()).toBeVisible();

    await page.goto('/');
    await expect(page.getByText('Quick help')).toBeVisible();
    await page.getByRole('button', { name: 'Chat' }).first().click();
    await expect(page).toHaveURL(/#chat$/);

    await page.goBack();
    await expect(page.getByText('Quick help')).toBeVisible();
  });
});

test.describe('command palette', () => {
  test.beforeEach(async ({ page }) => skipOnboarding(page));

  test('keyboard-only: open, arrow to the second command, run it', async ({ page }) => {
    await page.goto('/');
    // Wait for the app to be interactive before firing the shortcut.
    await expect(page.getByText('Quick help')).toBeVisible();
    await page.keyboard.press('ControlOrMeta+k');

    const input = page.getByRole('combobox', { name: 'Command palette' });
    await expect(input).toBeFocused();

    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    // Second command is the food quick action; it asks and closes the palette.
    await expect(page).toHaveURL(/#chat$/);
    await expect(page.getByText("Where's the nearest food?")).toBeVisible();
  });
});

test.describe('theme', () => {
  test.beforeEach(async ({ page }) => skipOnboarding(page));

  test('cycles system → light and persists across reload', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    await expect(html).not.toHaveAttribute('data-theme', /./);

    await page.getByRole('button', { name: /^Theme:/ }).click();
    await expect(html).toHaveAttribute('data-theme', 'light');

    await page.reload();
    await expect(html).toHaveAttribute('data-theme', 'light');
  });
});

test.describe('localization', () => {
  test('Arabic flips the document to RTL', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'العربية' }).click();
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  });
});

test.describe('mobile', () => {
  // Phone-sized viewport with touch: (pointer: coarse) media applies.
  test.use({ viewport: { width: 412, height: 915 }, hasTouch: true, isMobile: true });
  test.beforeEach(async ({ page }) => skipOnboarding(page));

  test('bottom nav navigates and itinerary controls are visible without hover', async ({
    page,
  }) => {
    await page.goto('/');
    const bottomNav = page.getByRole('navigation', { name: 'Main navigation' });
    await expect(bottomNav).toBeVisible();

    await bottomNav.getByRole('button', { name: 'Chat' }).click();
    await expect(page).toHaveURL(/#chat$/);

    // Touch devices get always-visible row controls (no hover to reveal them).
    const controls = page.locator('.row-reveal').first();
    await controls.scrollIntoViewIfNeeded();
    expect(await controls.evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
  });
});
