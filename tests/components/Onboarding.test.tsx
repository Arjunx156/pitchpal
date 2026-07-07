import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Onboarding } from '../../src/components/onboarding/Onboarding';
import { UI } from '../../src/i18n/ui';
import { renderWithProviders } from '../helpers/render';

describe('Onboarding', () => {
  beforeEach(() => localStorage.clear());

  it('renders nothing when closed', () => {
    const { container } = renderWithProviders(<Onboarding open={false} onClose={vi.fn()} />);
    expect(container.querySelector('.onb')).toBeNull();
  });

  it('steps through all three stages and finishes', async () => {
    const onClose = vi.fn();
    renderWithProviders(<Onboarding open onClose={onClose} />);

    // Step 1: language
    expect(screen.getByText(UI.en.onboarding.title)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: UI.en.onboarding.next }));
    // Step 2: accessibility
    await userEvent.click(screen.getByRole('button', { name: UI.en.onboarding.next }));
    // Step 3: seat/location
    expect(screen.getByLabelText(UI.en.locationLabel)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: UI.en.onboarding.finish }));

    expect(onClose).toHaveBeenCalled();
  });

  it('supports going back a step', async () => {
    renderWithProviders(<Onboarding open onClose={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: UI.en.onboarding.next }));
    await userEvent.click(screen.getByRole('button', { name: UI.en.onboarding.back }));
    expect(screen.getByText(UI.en.onboarding.title)).toBeInTheDocument();
  });

  it('persists a chosen language immediately', async () => {
    renderWithProviders(<Onboarding open onClose={vi.fn()} />);
    await userEvent.click(screen.getByLabelText('Español'));
    const saved = JSON.parse(localStorage.getItem('pitchpal.context') ?? '{}');
    expect(saved.language).toBe('es');
  });

  it('skips when Skip is pressed', async () => {
    const onClose = vi.fn();
    renderWithProviders(<Onboarding open onClose={onClose} />);
    await userEvent.click(screen.getByRole('button', { name: UI.en.onboarding.skip }));
    expect(onClose).toHaveBeenCalled();
  });
});
