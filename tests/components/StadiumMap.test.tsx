import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { StadiumMap } from '../../src/components/map/StadiumMap';
import { renderWithProviders } from '../helpers/render';
import { UI } from '../../src/i18n/ui';

describe('StadiumMap', () => {
  it('renders the stadium bowl and an idle wayfinding summary', () => {
    renderWithProviders(<StadiumMap />);
    // The SVG carries an accessible label; the idle summary is shown below it.
    expect(screen.getByRole('img')).toBeInTheDocument();
    expect(screen.getByText(UI.en.map.summaryIdle)).toBeInTheDocument();
  });
});
