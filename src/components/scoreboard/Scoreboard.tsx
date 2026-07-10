import { AnimatePresence, motion } from 'framer-motion';
import { CloudRain, Cloud, Sun, MapPin } from 'lucide-react';
import { getOpsSnapshot, type Weather } from '../../features/ops/opsFeed';
import { useFanContext } from '../../features/context/ContextProvider';
import { liveScore } from '../../features/tournament/fixture';
import { latestMoments, matchProgress, type MatchMoment } from '../../features/tournament/moments';
import { MOMENT_LABELS } from '../../i18n/answers';
import type { LanguageCode } from '../../features/context/types';
import { useNow } from '../../lib/useNow';
import { momentSlam } from '../../lib/motion';
import { FlipNumber } from './FlipNumber';

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

const WEATHER_ICON = { clear: Sun, cloudy: Cloud, rain: CloudRain } as const;

function momentText(moment: MatchMoment, language: LanguageCode): string {
  const label = MOMENT_LABELS[language][moment.kind];
  const who = [moment.teamCode, moment.detail].filter(Boolean).join(' ');
  return who ? `${moment.minute}' ${label} — ${who}` : `${moment.minute}' ${label}`;
}

/** Team side: big federation code (broadcast expanded) + full name beneath. */
function TeamSide({ code, name, align }: { code: string; name: string; align: 'start' | 'end' }) {
  return (
    <div className={`flex min-w-0 flex-col ${align === 'end' ? 'items-end text-right' : 'items-start'}`}>
      <span className="display-wide text-[clamp(1.6rem,1rem+3vw,3rem)] text-foreground">{code}</span>
      <span className="mt-0.5 truncate text-xs font-medium text-muted-foreground sm:text-sm">{name}</span>
    </div>
  );
}

/**
 * The signature. A persistent broadcast scoreboard: split-flap score, a live
 * ticking clock or kickoff countdown, a moment stinger that slams in on goals,
 * and a 90' progress rail with a half-time notch. Everything derives from the
 * shared virtual match clock, so it can never disagree with the assistant.
 */
export function Scoreboard() {
  const { ui, context, venue, fixture } = useFanContext();
  const now = useNow(1000);

  const ops = getOpsSnapshot(venue, now);
  const score = liveScore(ops.matchClock);
  const { home, away, group } = fixture;
  const remainingMs = Math.max(0, ops.kickoffAt - now);
  const countdown = `${Math.floor(remainingMs / 60000)}:${pad(Math.floor((remainingMs % 60000) / 1000))}`;
  const progress = matchProgress(ops.matchClock, ops.phase);
  const latest = latestMoments(fixture, ops.matchClock, ops.phase, 1)[0];
  const WeatherIcon = WEATHER_ICON[ops.weather as Weather];
  const weatherLabel =
    ops.weather === 'rain' ? ui.ops.weatherRain : ops.weather === 'cloudy' ? ui.ops.weatherCloudy : ui.ops.weatherClear;

  return (
    <motion.section
      className="glass scanlines relative isolate overflow-hidden rounded-2xl px-5 pb-5 pt-4 sm:px-8"
      aria-label={`${home.name} ${score.home}, ${away.name} ${score.away}. ${group}, ${venue.name}.`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <span aria-hidden className="brand-rule absolute inset-x-0 top-0" />
      <span aria-hidden className="floodlight" />

      {/* eyebrow: competition · venue · conditions */}
      <div className="relative mb-3 flex items-center justify-between gap-2">
        <p className="hud-eyebrow flex items-center gap-2">
          <span className="text-accent">{group}</span>
          <span aria-hidden className="h-1 w-1 rounded-full bg-border-strong" />
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <MapPin size={11} aria-hidden />
            <span className="truncate">{venue.name}</span>
          </span>
        </p>
        <p className="hud-eyebrow inline-flex items-center gap-1.5">
          <WeatherIcon size={13} aria-hidden />
          <span>{weatherLabel}</span>
          <span className="tabular text-foreground">{ops.temperatureC}°</span>
        </p>
      </div>

      {/* main row */}
      <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6">
        <TeamSide code={home.code} name={home.name} align="start" />

        <div className="flex flex-col items-center gap-2">
          <div
            className="flex items-center leading-none text-foreground"
            style={{ fontSize: 'clamp(3.4rem, 1.6rem + 7.5vw, 7rem)', fontVariationSettings: "'wght' 700" }}
          >
            <FlipNumber value={score.home} ariaLabel={`${home.name} ${score.home}`} />
            <span aria-hidden className="flex flex-col items-center gap-[0.14em] px-2 sm:px-3">
              <span className="h-[0.13em] w-[0.13em] rounded-full bg-accent" />
              <span className="h-[0.13em] w-[0.13em] rounded-full bg-accent" />
            </span>
            <FlipNumber value={score.away} ariaLabel={`${away.name} ${score.away}`} />
          </div>

          {ops.phase === 'live' ? (
            <span className="live-chip">
              <span className="live-dot" aria-hidden />
              {ui.ops.live} · {ops.matchClock}&apos;
            </span>
          ) : ops.phase === 'pre' ? (
            <span className="chip tabular text-muted-foreground">
              {ui.ops.preMatch} <span className="text-foreground">{countdown}</span>
            </span>
          ) : (
            <span className="chip uppercase tracking-[0.14em] text-muted-foreground">{ui.ops.postMatch}</span>
          )}
        </div>

        <TeamSide code={away.code} name={away.name} align="end" />
      </div>

      {/* moment stinger */}
      <div className="relative mt-3 flex h-6 items-center justify-center" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          {latest ? (
            <motion.p
              key={`${latest.minute}-${latest.kind}-${latest.teamCode ?? ''}`}
              variants={momentSlam}
              initial="hidden"
              animate="show"
              exit="exit"
              className="hud-eyebrow flex items-center gap-1.5 text-muted-foreground"
            >
              {latest.kind === 'goal' ? <span className="text-accent">⚽</span> : null}
              <span className={latest.kind === 'goal' ? 'text-foreground' : undefined}>
                {momentText(latest, context.language)}
              </span>
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>

      {/* 90' progress rail with half-time notch */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[3px] bg-[color-mix(in_oklab,var(--color-border)_70%,transparent)]"
      >
        <motion.span
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-pitch to-accent"
          initial={false}
          animate={{ width: `${progress * 100}%` }}
          transition={{ ease: 'easeOut', duration: 0.6 }}
        />
        <span className="absolute inset-y-[-2px] left-1/2 w-px bg-border-strong" />
      </div>
    </motion.section>
  );
}
