import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuickActions } from '../../src/components/dashboard/QuickActions';
import { renderWithProviders } from '../helpers/render';
import { UI } from '../../src/i18n/ui';

describe('QuickActions', () => {
  it('renders the quick-action labels and sends the matching query', async () => {
    const onAsk = vi.fn();
    renderWithProviders(<QuickActions onAsk={onAsk} />);
    const foodBtn = screen.getByRole('button', { name: UI.en.quickActions.food.label });
    await userEvent.click(foodBtn);
    expect(onAsk).toHaveBeenCalledWith(UI.en.quickActions.food.query);
  });
});
