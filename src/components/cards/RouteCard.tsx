import { Navigation } from 'lucide-react';
import type { RouteCard as RouteCardData } from '../../lib/cards';
import { fmt } from '../../i18n/answers';
import type { UiStrings } from '../../i18n/ui';

export function RouteCard({ card, ui }: { card: RouteCardData; ui: UiStrings }) {
  return (
    <figure className="card card--route" aria-label={card.title}>
      <figcaption className="card__title">
        <Navigation className="card__icon" size={18} aria-hidden="true" />
        {card.title}
      </figcaption>
      <div className="card__meta">
        {card.fromLabel ? (
          <span className="chip">
            <span className="chip__key">{ui.card.from}</span> {card.fromLabel}
          </span>
        ) : null}
        {card.toLabel ? (
          <span className="chip">
            <span className="chip__key">{ui.card.to}</span> {card.toLabel}
          </span>
        ) : null}
        {typeof card.etaMinutes === 'number' ? (
          <span className="chip">{fmt(ui.card.walk, { min: card.etaMinutes })}</span>
        ) : null}
        {typeof card.stepFree === 'boolean' ? (
          <span className={`chip ${card.stepFree ? 'chip--ok' : 'chip--warn'}`}>
            {card.stepFree ? ui.card.stepFree : ui.card.notStepFree}
          </span>
        ) : null}
      </div>
      <ol className="card__steps">
        {card.steps.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ol>
    </figure>
  );
}
