import { motion } from 'framer-motion';
import { Armchair, ChevronRight, Coffee, DoorOpen, Flag, LogOut, MapPin } from 'lucide-react';
import { useFanContext } from '../../features/context/ContextProvider';
import { getOpsSnapshot } from '../../features/ops/opsFeed';
import { buildItinerary, type ItineraryStepKind } from '../../features/itinerary/itinerary';
import { ITINERARY_LABELS } from '../../i18n/itinerary';
import { useNow } from '../../lib/useNow';
import { rowItem } from '../../lib/motion';
import { Panel } from '../ui/Panel';

const STEP_ICON: Record<Exclude<ItineraryStepKind, 'custom'>, typeof MapPin> = {
  arrive: MapPin,
  gate: DoorOpen,
  seat: Armchair,
  kickoff: Flag,
  halftime: Coffee,
  leave: LogOut,
};

export function NextUp({ onOpenItinerary }: { onOpenItinerary: () => void }) {
  const { ui, context, venue } = useFanContext();
  const now = useNow(30000);
  const ops = getOpsSnapshot(venue, now);
  const steps = buildItinerary(venue, ops).filter((s) => s.kind !== 'custom');

  const timeFmt = new Intl.DateTimeFormat(context.language, { hour: '2-digit', minute: '2-digit' });
  const nextIndex = Math.max(
    0,
    steps.findIndex((s) => s.time >= now),
  );
  const upcoming = steps.slice(nextIndex, nextIndex + 3);
  const shown = upcoming.length > 0 ? upcoming : steps.slice(-3);

  return (
    <Panel
      eyebrow={ui.nav.itinerary}
      heading="Next up"
      action={
        <button
          type="button"
          onClick={onOpenItinerary}
          className="inline-flex items-center gap-0.5 rounded-full border border-[color-mix(in_oklab,var(--color-accent)_35%,transparent)] px-2.5 py-1 text-2xs font-semibold text-accent transition-all hover:bg-[color-mix(in_oklab,var(--color-accent)_12%,transparent)] hover:translate-x-0.5"
        >
          {ui.dashboard.seeAll}
          <ChevronRight size={13} aria-hidden />
        </button>
      }
    >
      <ol className="relative flex flex-col gap-3">
        <span
          aria-hidden
          className="absolute bottom-3 left-[15px] top-3 w-px bg-[color-mix(in_oklab,var(--color-border)_80%,transparent)]"
        />
        {shown.map((step, i) => {
          const kind = step.kind as Exclude<ItineraryStepKind, 'custom'>;
          const Icon = STEP_ICON[kind];
          const isNext = i === 0 && upcoming.length > 0;
          return (
            <motion.li key={`${step.kind}-${step.time}`} variants={rowItem} className="relative flex items-center gap-3">
              <span
                className={`relative z-[1] grid h-8 w-8 shrink-0 place-items-center rounded-full border ${
                  isNext
                    ? 'border-transparent bg-accent text-on-accent shadow-[var(--glow-gold)]'
                    : 'border-border bg-surface text-muted-foreground'
                }`}
              >
                <Icon size={15} aria-hidden />
              </span>
              <span className="flex-1 text-sm font-medium text-foreground">
                {ITINERARY_LABELS[context.language][kind]}
                {step.transportName ? (
                  <span className="block text-2xs font-normal text-muted-foreground">{step.transportName}</span>
                ) : null}
              </span>
              <time className="tabular text-sm text-muted-foreground">{timeFmt.format(step.time)}</time>
            </motion.li>
          );
        })}
      </ol>
    </Panel>
  );
}
