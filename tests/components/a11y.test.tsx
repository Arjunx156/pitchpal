import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import App from '../../src/App';

expect.extend(toHaveNoViolations);

// jsdom can't compute layout/colour, so the color-contrast rule is disabled here
// and verified manually via the design tokens (WCAG 2.2 AA pairs).
const axeOptions = { rules: { 'color-contrast': { enabled: false } } };

describe('accessibility (axe)', () => {
  beforeEach(() => localStorage.clear());

  it('the initial view has no automatically-detectable violations', async () => {
    const { container } = render(<App />);
    const results = await axe(container, axeOptions);
    expect(results).toHaveNoViolations();
  });
});
