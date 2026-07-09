import { useEffect, useMemo, useState } from 'react';
import { getOpsSnapshot } from '../../features/ops/opsFeed';
import { useFanContext } from '../../features/context/ContextProvider';
import { useMapFocus } from '../../features/map/useMapFocus';
import { useItineraryOrder } from '../../features/itinerary/useItineraryOrder';
import { buildItinerary, type ItineraryStepKind } from '../../features/itinerary/itinerary';
import { SPEECH_LOCALE } from '../../features/voice/locale';
import { ITINERARY } from '../../i18n/ui';
import { fmt } from '../../i18n/answers';

const PREVIEW_COUNT = 3;

function stepLabel(
  kind: ItineraryStepKind,
  strings: (typeof ITINERARY)['en'],
  gateId: string | undefined,
  transportName: string | undefined,
  customLabel: string | undefined,
): string {
  if (kind === 'custom') return customLabel ?? '';
  if (kind === 'gate') return fmt(strings.gate, { id: gateId ?? '' });
  if (kind === 'leave') return fmt(strings.leave, { transport: transportName ?? '' });
  return strings[kind];
}

export function ItineraryPreviewTile({ onSeeAll }: { onSeeAll: () => void }) {
  const { ui, context, venue } = useFanContext();
  const focus = useMapFocus();
  const [now, setNow] = useState(() => Date.now());
  const strings = ITINERARY[context.language];

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const ops = useMemo(() => getOpsSnapshot(venue, now), [venue, now]);
  const baseSteps = useMemo(
    () => buildItinerary(venue, ops, focus.originGateId),
    [venue, ops, focus.originGateId],
  );
  const { steps } = useItineraryOrder(context.matchId, baseSteps);

  const formatter = useMemo(
    () => new Intl.DateTimeFormat(SPEECH_LOCALE[context.language], { hour: 'numeric', minute: '2-digit' }),
    [context.language],
  );

  const upcoming = steps.filter((s) => s.time > now).slice(0, PREVIEW_COUNT);
  const preview = upcoming.length > 0 ? upcoming : steps.slice(-PREVIEW_COUNT);

  return (
    <div className="bento-tile">
      <span className="bento-tile__eyebrow">{strings.heading}</span>
      <ul className="dashboard-itinerary-preview__list">
        {preview.map((step) => (
          <li key={step.kind === 'custom' ? step.id : step.kind} className="dashboard-itinerary-preview__row">
            <span className="dashboard-itinerary-preview__time tabular">{formatter.format(step.time)}</span>
            <span>{stepLabel(step.kind, strings, step.gateId, step.transportName, step.label)}</span>
          </li>
        ))}
      </ul>
      <button type="button" className="dashboard-itinerary-preview__link" onClick={onSeeAll}>
        {ui.dashboard.seeAll}
      </button>
    </div>
  );
}
