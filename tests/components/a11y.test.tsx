import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import App from '../../src/App';
import { UI } from '../../src/i18n/ui';
import { markOnboarded } from '../helpers/render';

expect.extend(toHaveNoViolations);

// jsdom can't compute layout/colour, so the color-contrast rule is disabled here
// and verified manually via the design tokens (WCAG 2.2 AA pairs).
const axeOptions = { rules: { 'color-contrast': { enabled: false } } };

describe('accessibility (axe)', () => {
  beforeEach(() => {
    localStorage.clear();
    markOnboarded();
  });

  it('the main app view has no automatically-detectable violations', async () => {
    const { container } = render(<App />);
    const results = await axe(container, axeOptions);
    expect(results).toHaveNoViolations();
  });

  it('the onboarding dialog has no automatically-detectable violations', async () => {
    localStorage.clear(); // force first-run onboarding
    const { container } = render(<App />);
    const results = await axe(container, axeOptions);
    expect(results).toHaveNoViolations();
  });

  it('the open More sheet has no violations (components are mounted in both rail and sheet)', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: new RegExp(`^${UI.en.nav.more}`) }));
    // Radix portals the sheet to document.body, and the rail copies stay in
    // the DOM — audit the whole document to catch duplicate-id regressions.
    const results = await axe(document.body, axeOptions);
    expect(results).toHaveNoViolations();
  });
});
