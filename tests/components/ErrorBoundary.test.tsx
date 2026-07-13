import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from '../../src/components/ui/ErrorBoundary';

function Bomb({ armed }: { armed: boolean }) {
  if (armed) throw new Error('boom');
  return <p>recovered content</p>;
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // React logs caught render errors to console.error — keep test output clean.
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders its children when nothing throws', () => {
    render(
      <ErrorBoundary heading="Something went wrong" actionLabel="Retry">
        <p>all good</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText('all good')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows a localized fallback with a retry action when a child throws', () => {
    render(
      <ErrorBoundary heading="Something went wrong" actionLabel="Retry">
        <Bomb armed />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });

  it('re-renders the children after retry once the fault is gone', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <ErrorBoundary heading="Something went wrong" actionLabel="Retry">
        <Bomb armed />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();

    rerender(
      <ErrorBoundary heading="Something went wrong" actionLabel="Retry">
        <Bomb armed={false} />
      </ErrorBoundary>,
    );
    await user.click(screen.getByRole('button', { name: 'Retry' }));

    expect(screen.getByText('recovered content')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
