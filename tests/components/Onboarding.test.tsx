import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Onboarding } from '../../src/components/onboarding/Onboarding';
import { renderWithProviders } from '../helpers/render';
import { UI } from '../../src/i18n/ui';

describe('Onboarding', () => {
  it('walks forward through the steps and finishes', async () => {
    const onClose = vi.fn();
    renderWithProviders(<Onboarding open onClose={onClose} />);

    expect(screen.getByText(UI.en.onboarding.title)).toBeInTheDocument();
    // Step 1 — language options.
    expect(screen.getByRole('button', { name: 'Español' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: UI.en.onboarding.next }));
    // Step 2 — accessibility profiles (await the animated step transition).
    expect(
      await screen.findByRole('button', { name: UI.en.accessibility.wheelchair }),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: UI.en.onboarding.next }));
    // Step 3 — finish.
    const finish = await screen.findByRole('button', { name: UI.en.onboarding.finish });
    await userEvent.click(finish);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('can be skipped', async () => {
    const onClose = vi.fn();
    renderWithProviders(<Onboarding open onClose={onClose} />);
    await userEvent.click(screen.getByRole('button', { name: UI.en.onboarding.skip }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
