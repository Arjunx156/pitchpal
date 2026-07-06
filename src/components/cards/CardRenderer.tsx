import type { AnswerCard } from '../../lib/cards';
import type { UiStrings } from '../../i18n/ui';
import { RouteCard } from './RouteCard';
import { AmenityCard } from './AmenityCard';
import { TransportCard } from './TransportCard';

export function CardRenderer({ card, ui }: { card: AnswerCard; ui: UiStrings }) {
  switch (card.type) {
    case 'route':
      return <RouteCard card={card} ui={ui} />;
    case 'amenity':
      return <AmenityCard card={card} ui={ui} />;
    case 'transport':
      return <TransportCard card={card} ui={ui} />;
    default:
      return null;
  }
}
