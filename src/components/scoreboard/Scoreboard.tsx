import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { getOpsSnapshot } from '../../features/ops/opsFeed';
import { useFanContext } from '../../features/context/ContextProvider';
import { liveScore } from '../../features/tournament/fixture';
import { latestMoments, matchProgress, type MatchMoment } from '../../features/tournament/moments';
import { MOMENT_LABELS } from '../../i18n/answers';
import type { LanguageCode } from '../../features/context/types';
import { ScoreDigit, TeamBlock } from './ScoreDigit';

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function momentText(moment: MatchMoment, language: LanguageCode): string {
  const label = MOMENT_LABELS[language][moment.kind];
  const who = [moment.teamCode, moment.detail].filter(Boolean).join(' ');
  return who ? `${moment.minute}' ${label} — ${who}` : `${moment.minute}' ${label}`;
}

export function Scoreboard() {
  const { ui, context, venue, fixture } = useFanContext();
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
  const progress = matchProgress(ops.matchClock, ops.phase);
  const latest = latestMoments(fixture, ops.matchClock, ops.phase, 1)[0];

  return (
    <motion.section
      className="relative isolate overflow-hidden rounded-lg border border-border bg-gradient-to-b from-surface to-surface-2 px-5 pb-6 pt-5 shadow-1 sm:px-8"
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
            <ScoreDigit value={score.home} />
            <span className="px-1.5 text-border-strong sm:px-3">:</span>
            <ScoreDigit value={score.away} />
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

      {/* latest moment ticker */}
      <div className="relative mt-3 flex h-5 items-center justify-center overflow-hidden" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          {latest ? (
            <motion.p
              key={`${latest.minute}-${latest.kind}-${latest.teamCode ?? ''}`}
              className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {latest.kind === 'goal' ? <span className="text-brand">⚽ </span> : null}
              {momentText(latest, context.language)}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>

      {/* 90-minute progress bar with half-time notch */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-[3px] bg-[color-mix(in_oklch,var(--color-border)_60%,transparent)]"
      >
        <motion.span
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-pitch to-brand"
          initial={false}
          animate={{ width: `${progress * 100}%` }}
          transition={{ ease: 'easeOut', duration: 0.6 }}
        />
        <span className="absolute inset-y-0 left-1/2 w-px bg-border-strong" />
      </div>
    </motion.section>
  );
}
