import { TrainFront } from 'lucide-react';
import type { TransportCard as TransportCardData } from '../../lib/cards';
import type { UiStrings } from '../../i18n/ui';

export function TransportCard({ card, ui }: { card: TransportCardData; ui: UiStrings }) {
  return (
    <figure className="card card--transport" aria-label={card.title}>
      <figcaption className="card__title">
        <TrainFront className="card__icon" size={18} aria-hidden="true" />
        {card.title}
      </figcaption>
      <ul className="card__list">
        {card.options.map((option, i) => (
          <li key={i} className="card__item">
            <span className="card__item-name">{option.name}</span>
            {option.detail ? <span className="card__item-detail">{option.detail}</span> : null}
            <span className="card__badges">
              {option.accessible ? <span className="chip chip--ok">{ui.card.accessible}</span> : null}
              {option.frequency ? (
                <span className="chip">
                  <span className="chip__key">{ui.card.frequency}</span> {option.frequency}
                </span>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
    </figure>
  );
}
