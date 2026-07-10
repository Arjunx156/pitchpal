import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Armchair, ChevronDown, ChevronUp, Coffee, DoorOpen, Flag, LogOut, MapPin, Plus, X } from 'lucide-react';
import { useFanContext } from '../../features/context/ContextProvider';
import type { LanguageCode } from '../../features/context/types';
import { getOpsSnapshot } from '../../features/ops/opsFeed';
import { buildItinerary, type ItineraryStep, type ItineraryStepKind } from '../../features/itinerary/itinerary';
import { useItineraryOrder } from '../../features/itinerary/useItineraryOrder';
import { useGateAlerts } from '../../features/notifications/useGateAlerts';
import { ITINERARY_LABELS } from '../../i18n/itinerary';
import { fmt } from '../../i18n/answers';
import { useNow } from '../../lib/useNow';
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

function stepLabel(step: ItineraryStep, language: LanguageCode): string {
  if (step.kind === 'custom') return step.label ?? '';
  return ITINERARY_LABELS[language][step.kind];
}

export function ItineraryPanel() {
  const { ui, context, venue } = useFanContext();
  const now = useNow(30000);
  const ops = getOpsSnapshot(venue, now);
  const base = useMemo(() => buildItinerary(venue, ops), [venue, ops]);
  const { steps, reorder, addCustomStep, removeCustomStep } = useItineraryOrder(context.matchId, base);
  const [draft, setDraft] = useState('');

  const gateStep = steps.find((s) => s.kind === 'gate');
  useGateAlerts(ops, gateStep?.gateId, ui.risk.heading, fmt(ui.suggestions.gateJamReason, { gate: gateStep?.gateId ?? '' }));

  const timeFmt = new Intl.DateTimeFormat(context.language, { hour: '2-digit', minute: '2-digit' });
  const nextIndex = steps.findIndex((s) => s.time >= now);

  const addStep = () => {
    const label = draft.trim();
    if (!label) return;
    addCustomStep(label, now);
    setDraft('');
  };

  return (
    <Panel eyebrow={ui.nav.itinerary} heading="My match day">
      <ol className="flex flex-col gap-1.5">
        <AnimatePresence initial={false}>
          {steps.map((step, i) => {
            const kind = step.kind;
            const Icon = kind === 'custom' ? Plus : STEP_ICON[kind];
            const isNext = i === nextIndex;
            return (
              <motion.li
                key={step.kind === 'custom' ? step.id : step.kind}
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
                <span className="flex-1 truncate text-sm font-medium text-foreground">
                  {stepLabel(step, context.language)}
                  {step.transportName ? (
                    <span className="block truncate text-2xs font-normal text-muted-foreground">
                      {step.transportName}
                    </span>
                  ) : null}
                </span>
                <time className="tabular text-xs text-muted-foreground">{timeFmt.format(step.time)}</time>
                <span className="flex items-center opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                  <button
                    type="button"
                    aria-label="Move earlier"
                    disabled={i === 0}
                    onClick={() => reorder(i, i - 1)}
                    className="grid h-6 w-6 place-items-center rounded text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    <ChevronUp size={14} aria-hidden />
                  </button>
                  <button
                    type="button"
                    aria-label="Move later"
                    disabled={i === steps.length - 1}
                    onClick={() => reorder(i, i + 1)}
                    className="grid h-6 w-6 place-items-center rounded text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    <ChevronDown size={14} aria-hidden />
                  </button>
                  {step.kind === 'custom' && step.id ? (
                    <button
                      type="button"
                      aria-label="Remove step"
                      onClick={() => removeCustomStep(step.id as string)}
                      className="grid h-6 w-6 place-items-center rounded text-muted-foreground hover:text-[var(--color-danger)]"
                    >
                      <X size={14} aria-hidden />
                    </button>
                  ) : null}
                </span>
              </motion.li>
            );
          })}
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
          placeholder="Add a step…"
          maxLength={60}
          className="flex-1 rounded-lg border border-border bg-[color-mix(in_oklab,var(--color-surface)_60%,transparent)] px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-[color-mix(in_oklab,var(--color-accent)_60%,transparent)] focus:outline-none"
        />
        <button
          type="submit"
          aria-label="Add step"
          disabled={!draft.trim()}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent text-on-accent transition-transform hover:scale-105 active:scale-95 disabled:opacity-40"
        >
          <Plus size={16} aria-hidden />
        </button>
      </form>
    </Panel>
  );
}
