import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { getOpsSnapshot } from '../../features/ops/opsFeed';
import { useFanContext } from '../../features/context/ContextProvider';
import { liveScore } from '../../features/tournament/fixture';

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function TeamBlock({ code, name, align }: { code: string; name: string; align: 'start' | 'end' }) {
  return (
    <div className={`flex min-w-0 flex-col gap-1 ${align === 'end' ? 'items-end text-end' : 'items-start'}`}>
      <span className="font-display text-3xl leading-[0.85] tracking-wide text-foreground sm:text-6xl">
        {code}
      </span>
      <span className="max-w-full truncate text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground sm:text-xs">
        {name}
      </span>
    </div>
  );
}

export function Scoreboard() {
  const { ui, venue, fixture } = useFanContext();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const ops = getOpsSnapshot(venue, now);
  const score = liveScore(ops.matchClock);
  const { home, away, group } = fixture;
  const remainingMs = Math.max(0, ops.kickoffAt - now);
  const countdown = `${Math.floor(remainingMs / 60000)}:${pad(Math.floor((remainingMs % 60000) / 1000))}`;

  return (
    <motion.section
      className="relative isolate overflow-hidden rounded-lg border border-border bg-gradient-to-b from-surface to-surface-2 px-5 py-5 shadow-1 sm:px-8 sm:py-6"
      aria-label={`${home.name} ${score.home}, ${away.name} ${score.away}, ${group}`}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 30 }}
    >
      {/* top brand hairline + soft pitch glow */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-brand to-transparent"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[120%] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--color-accent)_16%,transparent),transparent)]"
      />

      {/* eyebrow: competition + venue */}
      <div className="relative mb-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 px-2 text-center text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:text-[0.7rem]">
        <span className="text-brand">{group}</span>
        <span aria-hidden="true" className="h-1 w-1 rounded-full bg-border-strong" />
        <span className="inline-flex items-center gap-1">
          <MapPin size={12} aria-hidden="true" />
          {venue.name}
        </span>
      </div>

      <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-6">
        <TeamBlock code={home.code} name={home.name} align="start" />

        <div className="flex flex-col items-center gap-1.5">
          <span className="inline-flex items-baseline font-display text-4xl leading-none tracking-wider text-foreground tabular-nums sm:text-7xl">
            <span className="text-brand">{score.home}</span>
            <span className="px-1.5 text-border-strong sm:px-3">:</span>
            <span className="text-brand">{score.away}</span>
          </span>

          {ops.phase === 'live' ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[color-mix(in_oklch,var(--color-live)_45%,transparent)] bg-[color-mix(in_oklch,var(--color-live)_14%,transparent)] px-2.5 py-0.5 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-live">
              <motion.span
                className="h-1.5 w-1.5 rounded-full bg-live"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.4, repeat: Infinity }}
              />
              {ui.ops.live} · {ops.matchClock}&apos;
            </span>
          ) : ops.phase === 'pre' ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-0.5 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground tabular-nums">
              {ui.ops.preMatch} {countdown}
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full border border-border bg-surface px-2.5 py-0.5 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {ui.ops.postMatch}
            </span>
          )}
        </div>

        <TeamBlock code={away.code} name={away.name} align="end" />
      </div>
    </motion.section>
  );
}
