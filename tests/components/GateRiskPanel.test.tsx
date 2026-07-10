import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { GateRiskPanel } from '../../src/components/dashboard/GateRiskPanel';
import { renderWithProviders } from '../helpers/render';

describe('GateRiskPanel', () => {
  it('renders forecast rows with gate names and projected queue minutes', () => {
    renderWithProviders(<GateRiskPanel onAsk={vi.fn()} />);
    expect(screen.getByText('Gate risk')).toBeInTheDocument();
    // The default venue has named gates like "Gate A — North Plaza".
    expect(screen.getAllByText(/Gate [A-D]/).length).toBeGreaterThan(0);
    // Projected queue minutes are rendered with an "m" suffix.
    expect(screen.getAllByText(/\d+m/).length).toBeGreaterThan(0);
  });
});
