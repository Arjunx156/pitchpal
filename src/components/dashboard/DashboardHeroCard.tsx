import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { getOpsSnapshot } from '../../features/ops/opsFeed';
import { useFanContext } from '../../features/context/ContextProvider';
import { liveScore } from '../../features/tournament/fixture';
import { latestMoments, matchProgress } from '../../features/tournament/moments';
import { MOMENT_LABELS } from '../../i18n/answers';
import { ScoreDigit, TeamBlock } from '../scoreboard/ScoreDigit';

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function DashboardHeroCard() {
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
      className="bento-tile bento-tile--hero dashboard-hero"
      aria-labelledby="dashboard-hero-heading"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 30 }}
    >
      <span className="bento-tile__eyebrow" id="dashboard-hero-heading">
        {ui.dashboard.heroLabel} · {group}
      </span>

      <div className="dashboard-hero__score">
        <TeamBlock code={home.code} name={home.name} align="start" size="lg" />
        <span className="dashboard-hero__sep tabular">
          <ScoreDigit value={score.home} className="dashboard-hero__digit" />
          <span className="px-1.5 text-border-strong sm:px-3">:</span>
          <ScoreDigit value={score.away} className="dashboard-hero__digit" />
        </span>
        <TeamBlock code={away.code} name={away.name} align="end" size="lg" />
      </div>

      <div className="dashboard-hero__meta">
        {ops.phase === 'live' ? (
          <span className="inline-flex items-center gap-1.5 font-bold uppercase tracking-[0.12em] text-live">
            <motion.span
              className="h-1.5 w-1.5 rounded-full bg-live"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.4, repeat: Infinity }}
            />
            {ui.ops.live} · {ops.matchClock}&apos;
          </span>
        ) : ops.phase === 'pre' ? (
          <span className="tabular">
            {ui.ops.preMatch} {countdown}
          </span>
        ) : (
          <span>{ui.ops.postMatch}</span>
        )}

        <AnimatePresence mode="wait" initial={false}>
          {latest ? (
            <motion.span
              key={`${latest.minute}-${latest.kind}-${latest.teamCode ?? ''}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
            >
              {MOMENT_LABELS[context.language][latest.kind]}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </div>

      <div
        aria-hidden="true"
        className="relative h-[3px] rounded-full bg-[color-mix(in_oklch,var(--color-border)_60%,transparent)]"
      >
        <motion.span
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-pitch to-brand"
          initial={false}
          animate={{ width: `${progress * 100}%` }}
          transition={{ ease: 'easeOut', duration: 0.6 }}
        />
      </div>
    </motion.section>
  );
}
