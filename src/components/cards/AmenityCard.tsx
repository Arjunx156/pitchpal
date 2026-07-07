import { MapPin } from 'lucide-react';
import type { AmenityCard as AmenityCardData } from '../../lib/cards';
import type { UiStrings } from '../../i18n/ui';

export function AmenityCard({ card, ui }: { card: AmenityCardData; ui: UiStrings }) {
  return (
    <figure className="card card--amenity" aria-label={card.title}>
      <figcaption className="card__title">
        <MapPin className="card__icon" size={18} aria-hidden="true" />
        {card.title}
      </figcaption>
      <ul className="card__list">
        {card.items.map((item, i) => (
          <li key={i} className="card__item">
            <span className="card__item-name">{item.name}</span>
            {item.detail ? <span className="card__item-detail">{item.detail}</span> : null}
            <span className="card__badges">
              {item.stepFree ? <span className="chip chip--ok">{ui.card.stepFree}</span> : null}
              {item.hours ? (
                <span className="chip">
                  <span className="chip__key">{ui.card.hours}</span> {item.hours}
                </span>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
    </figure>
  );
}
