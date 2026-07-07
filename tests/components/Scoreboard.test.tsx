import { describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { Scoreboard } from '../../src/components/scoreboard/Scoreboard';
import { renderWithProviders } from '../helpers/render';

describe('Scoreboard', () => {
  beforeEach(() => localStorage.clear());

  it('renders both team codes', () => {
    renderWithProviders(<Scoreboard />);
    expect(screen.getByText('BRA')).toBeInTheDocument();
    expect(screen.getByText('ARG')).toBeInTheDocument();
  });

  it('exposes an accessible label with the score', () => {
    renderWithProviders(<Scoreboard />);
    expect(screen.getByLabelText(/Brazil.*Argentina/)).toBeInTheDocument();
  });
});
