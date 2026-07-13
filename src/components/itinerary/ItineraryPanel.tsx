import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Armchair,
  Bell,
  BellRing,
  ChevronDown,
  ChevronUp,
  Coffee,
  DoorOpen,
  Flag,
  LogOut,
  MapPin,
  Plus,
  X,
} from 'lucide-react';
import { useFanContext } from '../../features/context/ContextProvider';
import { getOpsSnapshot } from '../../features/ops/opsFeed';
import {
  buildItinerary,
  stepLabel,
  type ItineraryStep,
  type ItineraryStepKind,
} from '../../features/itinerary/itinerary';
import { useItineraryOrder } from '../../features/itinerary/useItineraryOrder';
import {
  useGateAlerts,
  type NotificationSupport,
} from '../../features/notifications/useGateAlerts';
import { useStepReminder } from '../../features/notifications/useStepReminder';
import { ITINERARY, type ItineraryStrings } from '../../i18n/ui';
import { fmt } from '../../i18n/answers';
import { useNow } from '../../hooks/useNow';
import { ACCENT_PILL, FIELD_SURFACE } from '../../lib/variants';
import { LiveRegion } from '../ui/LiveRegion';
import { Panel } from '../ui/Panel';
import { cn } from '../../lib/utils';

const STEP_ICON: Record<Exclude<ItineraryStepKind, 'custom'>, typeof MapPin> = {
  arrive: MapPin,
  gate: DoorOpen,
  seat: Armchair,
  kickoff: Flag,
  halftime: Coffee,
  leave: LogOut,
};

interface StepRowProps {
  step: ItineraryStep;
  index: number;
  total: number;
  isNext: boolean;
  strings: ItineraryStrings;
  permission: NotificationSupport;
  timeText: string;
  onMove: (from: number, to: number) => void;
  onRemove: (id: string) => void;
}

/** One itinerary row: label, time, reorder controls and a reminder bell. */
function StepRow({
  step,
  index,
  total,
  isNext,
  strings,
  permission,
  timeText,
  onMove,
  onRemove,
}: StepRowProps) {
  const label = stepLabel(step, strings);
  const reminder = useStepReminder(
    permission,
    step.time,
    strings.heading,
    `${label} · ${timeText}`,
  );
  const Icon = step.kind === 'custom' ? Plus : STEP_ICON[step.kind];

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className={cn(
        'group flex items-center gap-2.5 rounded-lg px-2 py-1.5',
        isNext && 'bg-[color-mix(in_oklab,var(--color-accent)_10%,transparent)]',
      )}
    >
      <span
        className={cn(
          'grid h-7 w-7 shrink-0 place-items-center rounded-full border',
          isNext
            ? 'border-transparent bg-accent text-on-accent'
            : 'border-border bg-surface text-muted-foreground',
        )}
      >
        <Icon size={13} aria-hidden />
      </span>
      <span className="flex-1 truncate text-sm font-medium text-foreground">{label}</span>
      <time className="tabular text-xs text-muted-foreground">{timeText}</time>
      <span className="row-reveal flex items-center">
        {permission !== 'unsupported' ? (
          <button
            type="button"
            aria-label={fmt(strings.reminderToggle, { step: label })}
            aria-pressed={reminder.armed}
            title={
              reminder.armed
                ? fmt(strings.reminderOn, { step: label })
                : fmt(strings.reminderToggle, { step: label })
            }
            onClick={reminder.toggle}
            className={cn(
              'grid h-6 w-6 place-items-center rounded',
              reminder.armed ? 'text-accent' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {reminder.armed ? <BellRing size={13} aria-hidden /> : <Bell size={13} aria-hidden />}
          </button>
        ) : null}
        <button
          type="button"
          aria-label={fmt(strings.moveEarlier, { step: label })}
          disabled={index === 0}
          onClick={() => onMove(index, index - 1)}
          className="grid h-6 w-6 place-items-center rounded text-muted-foreground hover:text-foreground disabled:opacity-30"
        >
          <ChevronUp size={14} aria-hidden />
        </button>
        <button
          type="button"
          aria-label={fmt(strings.moveLater, { step: label })}
          disabled={index === total - 1}
          onClick={() => onMove(index, index + 1)}
          className="grid h-6 w-6 place-items-center rounded text-muted-foreground hover:text-foreground disabled:opacity-30"
        >
          <ChevronDown size={14} aria-hidden />
        </button>
        {step.kind === 'custom' && step.id ? (
          <button
            type="button"
            aria-label={strings.removeStep}
            onClick={() => onRemove(step.id as string)}
            className="grid h-6 w-6 place-items-center rounded text-muted-foreground hover:text-[var(--color-danger)]"
          >
            <X size={14} aria-hidden />
          </button>
        ) : null}
      </span>
    </motion.li>
  );
}

export function ItineraryPanel() {
  const { ui, context, venue } = useFanContext();
  const now = useNow(30000);
  const ops = getOpsSnapshot(venue, now);
  const strings = ITINERARY[context.language];
  const base = useMemo(() => buildItinerary(venue, ops), [venue, ops]);
  const { steps, reorder, addCustomStep, removeCustomStep } = useItineraryOrder(
    context.matchId,
    base,
  );
  const [draft, setDraft] = useState('');

  const gateStep = steps.find((s) => s.kind === 'gate');
  const { permission, enable, announcement } = useGateAlerts(
    ops,
    gateStep?.gateId,
    strings.alertTitle,
    fmt(strings.alertBody, { gate: gateStep?.gateId ?? '' }),
  );

  const timeFmt = new Intl.DateTimeFormat(context.language, { hour: '2-digit', minute: '2-digit' });
  const nextIndex = steps.findIndex((s) => s.time >= now);

  const addStep = () => {
    const label = draft.trim();
    if (!label) return;
    addCustomStep(label, now);
    setDraft('');
  };

  return (
    <Panel
      eyebrow={ui.nav.itinerary}
      heading={strings.heading}
      action={
        permission === 'granted' ? (
          <span className="chip text-[var(--color-ok)]">
            <BellRing size={11} aria-hidden />
            {strings.alertsOn}
          </span>
        ) : permission !== 'unsupported' ? (
          <button
            type="button"
            onClick={() => void enable()}
            className={cn(ACCENT_PILL, 'gap-1 px-2.5 py-1 text-2xs transition-colors')}
          >
            <Bell size={11} aria-hidden />
            {strings.alertsEnable}
          </button>
        ) : null
      }
    >
      <LiveRegion message={announcement} />
      <ol className="flex flex-col gap-1.5">
        <AnimatePresence initial={false}>
          {steps.map((step, i) => (
            <StepRow
              key={step.kind === 'custom' ? step.id : step.kind}
              step={step}
              index={i}
              total={steps.length}
              isNext={i === nextIndex}
              strings={strings}
              permission={permission}
              timeText={timeFmt.format(step.time)}
              onMove={reorder}
              onRemove={removeCustomStep}
            />
          ))}
        </AnimatePresence>
      </ol>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          addStep();
        }}
        className="mt-3 flex items-center gap-2"
      >
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={`${strings.addStep}…`}
          aria-label={strings.addStep}
          maxLength={60}
          className={cn(FIELD_SURFACE, 'flex-1 px-3 py-1.5 placeholder:text-muted-foreground')}
        />
        <button
          type="submit"
          aria-label={strings.addStep}
          disabled={!draft.trim()}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent text-on-accent transition-transform hover:scale-105 active:scale-95 disabled:opacity-40"
        >
          <Plus size={16} aria-hidden />
        </button>
      </form>
    </Panel>
  );
}
