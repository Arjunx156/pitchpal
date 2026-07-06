import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CardRenderer } from '../../src/components/cards/CardRenderer';
import { UI } from '../../src/i18n/ui';
import type { AnswerCard } from '../../src/lib/cards';

describe('CardRenderer', () => {
  it('renders a route card with steps, ETA and step-free status', () => {
    const card: AnswerCard = {
      type: 'route',
      title: 'To section 205',
      fromLabel: 'Gate B',
      toLabel: '#205',
      etaMinutes: 8,
      stepFree: true,
      steps: ['Enter at Gate C', 'Take the elevator'],
    };
    render(<CardRenderer card={card} ui={UI.en} />);

    expect(screen.getByText('To section 205')).toBeInTheDocument();
    expect(screen.getByText('Enter at Gate C')).toBeInTheDocument();
    expect(screen.getByText('8 min walk')).toBeInTheDocument();
    expect(screen.getByText(UI.en.card.stepFree)).toBeInTheDocument();
  });

  it('marks a non-step-free route with the warning label', () => {
    const card: AnswerCard = {
      type: 'route',
      title: 'To section 320',
      etaMinutes: 14,
      stepFree: false,
      steps: ['Head to Gate D'],
    };
    render(<CardRenderer card={card} ui={UI.en} />);
    expect(screen.getByText(UI.en.card.notStepFree)).toBeInTheDocument();
  });

  it('renders an amenity card list', () => {
    const card: AnswerCard = {
      type: 'amenity',
      title: 'Nearby options',
      items: [
        { name: 'Crescent Grill', detail: 'Near section 114', stepFree: true, hours: 'All day' },
      ],
    };
    render(<CardRenderer card={card} ui={UI.en} />);
    expect(screen.getByText('Crescent Grill')).toBeInTheDocument();
    expect(screen.getByText('Near section 114')).toBeInTheDocument();
  });

  it('renders a transport card with accessible + frequency badges', () => {
    const card: AnswerCard = {
      type: 'transport',
      title: 'Getting away',
      options: [
        { name: 'North Line', detail: 'Rail to downtown', accessible: true, frequency: 'Every 6 min' },
      ],
    };
    render(<CardRenderer card={card} ui={UI.en} />);
    expect(screen.getByText('North Line')).toBeInTheDocument();
    expect(screen.getByText(UI.en.card.accessible)).toBeInTheDocument();
    expect(screen.getByText('Every 6 min')).toBeInTheDocument();
  });
});
