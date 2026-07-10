import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { Standings } from '../../src/components/standings/Standings';
import { renderWithProviders } from '../helpers/render';

describe('Standings', () => {
  it('renders the group table for the default fixture', () => {
    renderWithProviders(<Standings />);
    // Group C teams
    expect(screen.getByText('CMR')).toBeInTheDocument();
    expect(screen.getByText('KOR')).toBeInTheDocument();
    // playing teams highlighted but still present
    expect(screen.getAllByText('BRA').length).toBeGreaterThan(0);
  });
});
