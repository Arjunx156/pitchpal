import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BellRing } from 'lucide-react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { getOpsSnapshot } from '../../features/ops/opsFeed';
import { useFanContext } from '../../features/context/ContextProvider';
import { useMapFocus } from '../../features/map/useMapFocus';
import { useGateAlerts } from '../../features/notifications/useGateAlerts';
import { useItineraryOrder } from '../../features/itinerary/useItineraryOrder';
import { buildItinerary, type ItineraryStepKind } from '../../features/itinerary/itinerary';
import { SPEECH_LOCALE } from '../../features/voice/locale';
import { ITINERARY } from '../../i18n/ui';
import { fmt } from '../../i18n/answers';
import { panelItem, staggerContainer } from '../../lib/motion';
import { ItineraryStepRow } from './ItineraryStepRow';

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

function stepKey(kind: ItineraryStepKind, id: string | undefined): string {
  return kind === 'custom' ? (id ?? '') : kind;
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
  const baseSteps = useMemo(
    () => buildItinerary(venue, ops, focus.originGateId),
    [venue, ops, focus.originGateId],
  );
  const { steps, reorder } = useItineraryOrder(context.matchId, baseSteps);

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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const itemIds = steps.map((s) => stepKey(s.kind, s.id));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromIndex = itemIds.indexOf(String(active.id));
    const toIndex = itemIds.indexOf(String(over.id));
    if (fromIndex === -1 || toIndex === -1) return;
    reorder(fromIndex, toIndex);
  };

  return (
    <motion.section className="itinerary" aria-labelledby="itinerary-heading" variants={panelItem}>
      <div className="itinerary__head">
        <h2 id="itinerary-heading" className="itinerary__heading">
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
      <p className="visually-hidden">{strings.reorderHint}</p>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          <motion.ol className="itinerary__list" variants={staggerContainer} initial="hidden" animate="show">
            {steps.map((step, i) => {
              const isDone = step.time <= now;
              const isCurrent = isDone && (steps[i + 1] ? steps[i + 1]!.time > now : false);
              const label = stepLabel(step.kind, strings, step.gateId, step.transportName, step.label);
              return (
                <ItineraryStepRow
                  key={stepKey(step.kind, step.id)}
                  id={stepKey(step.kind, step.id)}
                  step={step}
                  label={label}
                  timeLabel={formatter.format(step.time)}
                  isDone={isDone}
                  isCurrent={isCurrent}
                  permission={alerts.permission}
                  strings={strings}
                />
              );
            })}
          </motion.ol>
        </SortableContext>
      </DndContext>
    </motion.section>
  );
}
