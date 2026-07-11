import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dialog } from '../../src/components/ui/Dialog';

describe('Dialog', () => {
  it('renders its title and content when open', () => {
    render(
      <Dialog open title="Settings" onClose={vi.fn()}>
        <p>Dialog body</p>
      </Dialog>,
    );
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Dialog body')).toBeInTheDocument();
  });

  it('closes on Escape', async () => {
    const onClose = vi.fn();
    render(
      <Dialog open title="Settings" onClose={onClose}>
        <p>Dialog body</p>
      </Dialog>,
    );
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });

  it('moves focus into the dialog on open (WCAG 2.4.3)', () => {
    render(
      <Dialog open title="Settings" onClose={vi.fn()}>
        <p>Dialog body</p>
      </Dialog>,
    );
    // Focus should land inside the dialog, not remain on the document body.
    const dialog = screen.getByRole('dialog');
    expect(dialog.contains(document.activeElement)).toBe(true);
  });
});
