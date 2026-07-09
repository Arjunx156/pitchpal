import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen } from '@testing-library/react';
import { GateRiskPanel } from '../../src/components/risk/GateRiskPanel';
import { UI } from '../../src/i18n/ui';
import { venue } from '../../src/features/venue/venue-data';
import { renderWithProviders } from '../helpers/render';

const MIN = 60_000;

describe('GateRiskPanel', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it('renders a forecast row for every gate', () => {
    vi.spyOn(Date, 'now').mockReturnValue(30 * MIN);
    const { container } = renderWithProviders(<GateRiskPanel />);
    expect(screen.getByText(UI.en.risk.heading)).toBeInTheDocument();
    expect(container.querySelectorAll('.risk-panel__row')).toHaveLength(venue.gates.length);
  });
});
