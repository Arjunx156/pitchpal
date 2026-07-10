import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { Scoreboard } from '../../src/components/scoreboard/Scoreboard';
import { renderWithProviders } from '../helpers/render';

describe('Scoreboard', () => {
  it('renders both team federation codes for the default fixture', () => {
    renderWithProviders(<Scoreboard />);
    expect(screen.getByText('BRA')).toBeInTheDocument();
    expect(screen.getByText('ARG')).toBeInTheDocument();
  });

  it('exposes accessible labels naming the teams', () => {
    renderWithProviders(<Scoreboard />);
    // The section label and the score digits both name the teams.
    expect(screen.getAllByLabelText(/Brazil/i).length).toBeGreaterThan(0);
  });
});
