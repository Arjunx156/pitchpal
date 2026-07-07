import { useEffect, useMemo, useState } from 'react';
import { BellRing } from 'lucide-react';
import { getOpsSnapshot } from '../../features/ops/opsFeed';
import { useFanContext } from '../../features/context/ContextProvider';
import { useMapFocus } from '../../features/map/useMapFocus';
import { useGateAlerts } from '../../features/notifications/useGateAlerts';
import { buildItinerary, type ItineraryStepKind } from '../../features/itinerary/itinerary';
import { SPEECH_LOCALE } from '../../features/voice/locale';
import { ITINERARY } from '../../i18n/ui';
import { fmt } from '../../i18n/answers';

function stepLabel(
  kind: ItineraryStepKind,
  strings: (typeof ITINERARY)['en'],
  gateId: string | undefined,
  transportName: string | undefined,
): string {
  if (kind === 'gate') return fmt(strings.gate, { id: gateId ?? '' });
  if (kind === 'leave') return fmt(strings.leave, { transport: transportName ?? '' });
  return strings[kind];
}

export function ItineraryPanel() {
  const { context, venue } = useFanContext();
  const focus = useMapFocus();
  const [now, setNow] = useState(() => Date.now());
  const strings = ITINERARY[context.language];

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const ops = useMemo(() => getOpsSnapshot(venue, now), [venue, now]);
  const steps = useMemo(
    () => buildItinerary(venue, ops, focus.originGateId),
    [venue, ops, focus.originGateId],
  );
  const gateStep = steps.find((s) => s.kind === 'gate');
  const alerts = useGateAlerts(
    ops,
    gateStep?.gateId,
    strings.alertTitle,
    fmt(strings.alertBody, { gate: gateStep?.gateId ?? '' }),
  );

  const formatter = useMemo(
    () => new Intl.DateTimeFormat(SPEECH_LOCALE[context.language], { hour: 'numeric', minute: '2-digit' }),
    [context.language],
  );

  return (
    <section className="itinerary" aria-labelledby="itinerary-heading">
      <div className="itinerary__head">
        <h2 id="itinerary-heading" className="itinerary__heading display">
          {strings.heading}
        </h2>
        {alerts.permission !== 'unsupported' ? (
          <button
            type="button"
            className="itinerary__alert-btn"
            aria-pressed={alerts.permission === 'granted'}
            disabled={alerts.permission === 'granted'}
            onClick={() => void alerts.enable()}
          >
            <BellRing size={14} aria-hidden="true" />
            {alerts.permission === 'granted' ? strings.alertsOn : strings.alertsEnable}
          </button>
        ) : (
          <p className="itinerary__unsupported">{strings.alertsUnsupported}</p>
        )}
      </div>

      <ol className="itinerary__list">
        {steps.map((step) => (
          <li key={step.kind} className="itinerary__step">
            <span className="itinerary__time tabular">{formatter.format(step.time)}</span>
            <span className="itinerary__label">
              {stepLabel(step.kind, strings, step.gateId, step.transportName)}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
