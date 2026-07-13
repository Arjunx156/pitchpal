import { useFanContext } from '../../features/context/ContextProvider';
import { getOpsSnapshot } from '../../features/ops/opsFeed';
import { latestMoments } from '../../features/tournament/moments';
import { formatMoment, fmt } from '../../i18n/answers';
import { useNow } from '../../hooks/useNow';

const TICKER_REFRESH_MS = 15_000;
const TICKER_MOMENTS = 6;

/**
 * Broadcast lower-third: a slim marquee of recent match moments under the
 * scoreboard (pre-match it carries live gate queues instead, so it is never
 * empty). The scrolling copy is decorative (aria-hidden) — a static sr-only
 * line carries the same content, and the global prefers-reduced-motion rules
 * freeze the scroll.
 */
export function MomentTicker() {
  const { ui, context, venue, fixture } = useFanContext();
  const now = useNow(TICKER_REFRESH_MS);
  const ops = getOpsSnapshot(venue, now);
  const moments = latestMoments(fixture, ops.matchClock, ops.phase, TICKER_MOMENTS);

  const items = moments.length
    ? moments.map((moment) => formatMoment(moment, context.language))
    : ops.gates.map(
        (gate) =>
          `${ui.ops.gate} ${gate.gateId} · ${fmt(ui.ops.queue, { min: gate.queueMinutes })}`,
      );

  if (items.length === 0) return null;

  return (
    <section className="glass overflow-hidden rounded-full" aria-label={ui.ops.heading}>
      <p className="sr-only">{items.join(' · ')}</p>
      <div className="ticker" aria-hidden>
        {/* Two copies make the -50% translate loop seamless. */}
        <div className="ticker__track px-5 py-1.5">
          {[...items, ...items].map((text, i) => (
            <span key={i} className="hud-eyebrow inline-flex items-center gap-2">
              <span className="text-accent">●</span>
              {text}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
