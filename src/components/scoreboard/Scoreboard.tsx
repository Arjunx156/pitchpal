import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getOpsSnapshot } from '../../features/ops/opsFeed';
import { venue } from '../../features/venue/venue-data';
import { useFanContext } from '../../features/context/ContextProvider';
import { CURRENT_FIXTURE, liveScore } from '../../features/tournament/fixture';

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function TeamBlock({ code, name, align }: { code: string; name: string; align: 'start' | 'end' }) {
  return (
    <div className={`flex min-w-0 flex-col ${align === 'end' ? 'items-end text-end' : 'items-start'}`}>
      <span className="font-display text-3xl leading-none tracking-wide text-foreground sm:text-4xl">
        {code}
      </span>
      <span className="truncate text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {name}
      </span>
    </div>
  );
}

export function Scoreboard() {
  const { ui } = useFanContext();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const ops = getOpsSnapshot(venue, now);
  const score = liveScore(ops.matchClock);
  const { home, away, group } = CURRENT_FIXTURE;
  const remainingMs = Math.max(0, ops.kickoffAt - now);
  const countdown = `${Math.floor(remainingMs / 60000)}:${pad(Math.floor((remainingMs % 60000) / 1000))}`;

  return (
    <motion.section
      className="relative isolate overflow-hidden rounded-lg border border-border bg-gradient-to-b from-surface to-surface-2 px-5 py-3 shadow-1"
      aria-label={`${home.name} ${score.home}, ${away.name} ${score.away}, ${group}`}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 30 }}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand to-transparent"
      />
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <TeamBlock code={home.code} name={home.name} align="start" />

        <div className="flex flex-col items-center gap-0.5">
          <span className="font-display text-4xl leading-none tracking-wider text-brand tabular-nums sm:text-5xl">
            {score.home}
            <span className="px-1 text-muted-foreground">:</span>
            {score.away}
          </span>
          {ops.phase === 'live' ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-live">
              <motion.span
                className="h-2 w-2 rounded-full bg-live"
                animate={{ opacity: [1, 0.35, 1] }}
                transition={{ duration: 1.4, repeat: Infinity }}
              />
              {ui.ops.live} · {ops.matchClock}&apos;
            </span>
          ) : ops.phase === 'pre' ? (
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground tabular-nums">
              {ui.ops.preMatch} {countdown}
            </span>
          ) : (
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {ui.ops.postMatch}
            </span>
          )}
        </div>

        <TeamBlock code={away.code} name={away.name} align="end" />
      </div>
    </motion.section>
  );
}
