import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { OpsHud } from '../../src/components/ops/OpsHud';
import { renderWithProviders } from '../helpers/render';
import { UI } from '../../src/i18n/ui';

describe('OpsHud', () => {
  it('renders stadium load and per-gate queue times', () => {
    renderWithProviders(<OpsHud />);
    expect(screen.getByText(UI.en.ops.gatesHeading)).toBeInTheDocument();
    expect(screen.getByText(/% full/)).toBeInTheDocument();
    expect(screen.getAllByText(/Gate [A-D]/).length).toBeGreaterThan(0);
  });
});
