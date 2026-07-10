import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SuggestedActions } from '../../src/components/dashboard/SuggestedActions';
import { renderWithProviders } from '../helpers/render';

describe('SuggestedActions', () => {
  it('always shows at least one actionable suggestion (evergreen fallback)', async () => {
    const onAsk = vi.fn();
    renderWithProviders(<SuggestedActions onAsk={onAsk} />);
    expect(screen.getByText('Suggested for you')).toBeInTheDocument();
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
    await userEvent.click(buttons[0]!);
    expect(onAsk).toHaveBeenCalledOnce();
  });
});
