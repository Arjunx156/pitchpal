import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen } from '@testing-library/react';
import { OpsHud } from '../../src/components/ops/OpsHud';
import { UI } from '../../src/i18n/ui';
import { venue } from '../../src/features/venue/venue-data';
import { renderWithProviders } from '../helpers/render';

const MIN = 60_000;

describe('OpsHud', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it('shows a kickoff countdown and a meter per gate before the match', () => {
    vi.spyOn(Date, 'now').mockReturnValue(10 * MIN);
    renderWithProviders(<OpsHud />);
    expect(screen.getByText(UI.en.ops.preMatch)).toBeInTheDocument();
    expect(screen.getAllByRole('meter')).toHaveLength(venue.gates.length);
  });

  it('shows the live indicator during the match', () => {
    vi.spyOn(Date, 'now').mockReturnValue(60 * MIN);
    renderWithProviders(<OpsHud />);
    expect(screen.getByText(UI.en.ops.live)).toBeInTheDocument();
  });

  it('shows full time after the match', () => {
    vi.spyOn(Date, 'now').mockReturnValue(137 * MIN);
    renderWithProviders(<OpsHud />);
    expect(screen.getByText(UI.en.ops.postMatch)).toBeInTheDocument();
  });
});
