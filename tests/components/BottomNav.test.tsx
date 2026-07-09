import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BottomNav } from '../../src/components/nav/BottomNav';
import { UI } from '../../src/i18n/ui';
import { renderWithProviders } from '../helpers/render';

describe('BottomNav', () => {
  beforeEach(() => localStorage.clear());

  it('marks the active surface with aria-current and calls onChange when another is tapped', async () => {
    const onChange = vi.fn();
    renderWithProviders(<BottomNav surface="home" onChange={onChange} onMore={vi.fn()} />);

    const homeBtn = screen.getByRole('button', { name: new RegExp(`^${UI.en.nav.home}`) });
    expect(homeBtn).toHaveAttribute('aria-current', 'page');

    const chatBtn = screen.getByRole('button', { name: new RegExp(`^${UI.en.nav.chat}`) });
    expect(chatBtn).not.toHaveAttribute('aria-current');

    await userEvent.click(chatBtn);
    expect(onChange).toHaveBeenCalledWith('chat');
  });

  it('calls onMore when the More button is tapped', async () => {
    const onMore = vi.fn();
    renderWithProviders(<BottomNav surface="home" onChange={vi.fn()} onMore={onMore} />);
    await userEvent.click(screen.getByRole('button', { name: new RegExp(`^${UI.en.nav.more}`) }));
    expect(onMore).toHaveBeenCalled();
  });
});
