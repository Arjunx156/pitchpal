import { useSyncExternalStore } from 'react';

/**
 * Shared app clock. One interval per distinct cadence feeds every subscriber,
 * replacing the per-component `useState(Date.now()) + setInterval` pattern that
 * used to run eight uncoordinated timers (and eight re-render cascades) at once.
 */
interface Ticker {
  now: number;
  listeners: Set<() => void>;
  timer: ReturnType<typeof setInterval> | null;
}

const tickers = new Map<number, Ticker>();

function getTicker(intervalMs: number): Ticker {
  let ticker = tickers.get(intervalMs);
  if (!ticker) {
    ticker = { now: Date.now(), listeners: new Set(), timer: null };
    tickers.set(intervalMs, ticker);
  }
  return ticker;
}

function subscribe(intervalMs: number, listener: () => void): () => void {
  const ticker = getTicker(intervalMs);
  ticker.listeners.add(listener);
  if (ticker.timer === null) {
    // Waking an idle ticker: refresh the timestamp so the first subscriber
    // doesn't render with however-old the last session's value is. Triggers at
    // most one extra render because the subscriber identity is stable.
    ticker.now = Date.now();
    ticker.timer = setInterval(() => {
      ticker.now = Date.now();
      for (const notify of ticker.listeners) notify();
    }, intervalMs);
  }
  return () => {
    ticker.listeners.delete(listener);
    if (ticker.listeners.size === 0 && ticker.timer !== null) {
      clearInterval(ticker.timer);
      ticker.timer = null;
    }
  };
}

// useSyncExternalStore re-subscribes whenever the subscribe function identity
// changes — hand it one stable closure per cadence, never an inline arrow.
const subscribers = new Map<number, (listener: () => void) => () => void>();
const snapshots = new Map<number, () => number>();

function getSubscriber(intervalMs: number): (listener: () => void) => () => void {
  let fn = subscribers.get(intervalMs);
  if (!fn) {
    fn = (listener) => subscribe(intervalMs, listener);
    subscribers.set(intervalMs, fn);
  }
  return fn;
}

function getSnapshot(intervalMs: number): () => number {
  let fn = snapshots.get(intervalMs);
  if (!fn) {
    fn = () => getTicker(intervalMs).now;
    snapshots.set(intervalMs, fn);
  }
  return fn;
}

/** Current timestamp, refreshed every `intervalMs` on a shared interval. */
export function useNow(intervalMs: number): number {
  return useSyncExternalStore(
    getSubscriber(intervalMs),
    getSnapshot(intervalMs),
    getSnapshot(intervalMs),
  );
}
