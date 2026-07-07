import { useEffect, useState } from 'react';
import {
  busiestGate,
  crowdSeries,
  gateQueueSeries,
  getOpsSnapshot,
} from '../../features/ops/opsFeed';
import { useFanContext } from '../../features/context/ContextProvider';
import { ANALYTICS } from '../../i18n/ui';
import { fmt } from '../../i18n/answers';
import { Sparkline } from '../charts/Sparkline';

export function CrowdAnalytics() {
  const { context, venue } = useFanContext();
  const a = ANALYTICS[context.language];
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 10_000);
    return () => clearInterval(id);
  }, []);

  const snapshot = getOpsSnapshot(venue, now);
  const busiest = busiestGate(snapshot);
  const crowd = crowdSeries(venue, now);
  const pct = crowd[crowd.length - 1] ?? 0;
  const queue = busiest ? gateQueueSeries(venue, busiest.gateId, now) : [];

  return (
    <section className="analytics" aria-labelledby="analytics-heading">
      <h2 id="analytics-heading" className="analytics__heading display">
        {a.heading}
      </h2>
      <div className="analytics__grid">
        <div className="analytics__stat">
          <p className="analytics__label">{a.crowd}</p>
          <Sparkline data={crowd} area ariaLabel={fmt(a.crowdSummary, { pct })} />
          <p className="analytics__value tabular">{pct}%</p>
        </div>
        {busiest ? (
          <div className="analytics__stat">
            <p className="analytics__label">{fmt(a.queue, { gate: busiest.gateId })}</p>
            <Sparkline
              data={queue}
              ariaLabel={fmt(a.queueSummary, { gate: busiest.gateId, min: busiest.queueMinutes })}
            />
            <p className="analytics__value tabular">{busiest.queueMinutes}m</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
