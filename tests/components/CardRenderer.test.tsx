import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CardRenderer } from '../../src/components/cards/CardRenderer';
import { UI } from '../../src/i18n/ui';
import type { AnswerCard } from '../../src/lib/cards';

describe('CardRenderer', () => {
  it('renders a route card with its title, ETA and ordered steps', () => {
    const card: AnswerCard = {
      type: 'route',
      title: 'Directions to section 114',
      toLabel: '114',
      etaMinutes: 6,
      stepFree: true,
      steps: ['Enter at Gate C', 'Take the elevator', 'Section 114 is on the south side'],
    };
    render(<CardRenderer card={card} ui={UI.en} />);
    expect(screen.getByText('Directions to section 114')).toBeInTheDocument();
    expect(screen.getByText('Enter at Gate C')).toBeInTheDocument();
    expect(screen.getByText(/6 min/)).toBeInTheDocument();
  });

  it('renders an amenity card list', () => {
    const card: AnswerCard = {
      type: 'amenity',
      title: 'Nearby food',
      items: [{ name: 'Taco stand', detail: 'Vegetarian options', hours: '10:00–22:00' }],
    };
    render(<CardRenderer card={card} ui={UI.en} />);
    expect(screen.getByText('Nearby food')).toBeInTheDocument();
    expect(screen.getByText('Taco stand')).toBeInTheDocument();
  });

  it('renders a transport card list', () => {
    const card: AnswerCard = {
      type: 'transport',
      title: 'Getting home',
      options: [{ name: 'Metro Line 2', frequency: 'Every 5 min', accessible: true }],
    };
    render(<CardRenderer card={card} ui={UI.en} />);
    expect(screen.getByText('Getting home')).toBeInTheDocument();
    expect(screen.getByText('Metro Line 2')).toBeInTheDocument();
  });
});
