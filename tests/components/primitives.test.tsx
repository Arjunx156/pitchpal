import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FlipNumber } from '../../src/components/scoreboard/FlipNumber';
import { Sparkline } from '../../src/components/charts/Sparkline';
import { Panel } from '../../src/components/ui/Panel';
import { LiveRegion } from '../../src/components/ui/LiveRegion';

describe('FlipNumber', () => {
  it('exposes its value via an accessible label', () => {
    render(<FlipNumber value={7} ariaLabel="Brazil 7" />);
    expect(screen.getByLabelText('Brazil 7')).toBeInTheDocument();
  });
});

describe('Sparkline', () => {
  it('renders an SVG trend path for the given values', () => {
    const { container } = render(<Sparkline values={[2, 5, 3, 8]} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(container.querySelector('path')).toBeInTheDocument();
  });
});

describe('Panel', () => {
  it('renders the eyebrow, heading and children', () => {
    render(
      <Panel eyebrow="Wayfinding" heading="Stadium map">
        <p>Panel body</p>
      </Panel>,
    );
    expect(screen.getByRole('heading', { name: 'Stadium map' })).toBeInTheDocument();
    expect(screen.getByText('Wayfinding')).toBeInTheDocument();
    expect(screen.getByText('Panel body')).toBeInTheDocument();
  });
});

describe('LiveRegion', () => {
  it('announces its message politely', () => {
    render(<LiveRegion message="Goal — Brazil" />);
    const region = screen.getByRole('status');
    expect(region).toHaveTextContent('Goal — Brazil');
    expect(region).toHaveAttribute('aria-live', 'polite');
  });
});
