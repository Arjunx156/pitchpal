import { useEffect, useState } from 'react';
import { Cloud, CloudRain, Sun } from 'lucide-react';
import {
  getOpsSnapshot,
  type CongestionLevel,
  type Weather,
} from '../../features/ops/opsFeed';
import { useFanContext } from '../../features/context/ContextProvider';
import type { UiStrings } from '../../i18n/ui';

function WeatherIcon({ weather }: { weather: Weather }) {
  if (weather === 'rain') return <CloudRain size={16} aria-hidden="true" />;
  if (weather === 'cloudy') return <Cloud size={16} aria-hidden="true" />;
  return <Sun size={16} aria-hidden="true" />;
}

function weatherLabel(weather: Weather, ui: UiStrings): string {
  return weather === 'rain'
    ? ui.ops.weatherRain
    : weather === 'cloudy'
      ? ui.ops.weatherCloudy
      : ui.ops.weatherClear;
}

function levelLabel(level: CongestionLevel, ui: UiStrings): string {
  return level === 'jam' ? ui.ops.packed : level === 'busy' ? ui.ops.busy : ui.ops.quiet;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function OpsHud() {
  const { ui, venue } = useFanContext();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const ops = getOpsSnapshot(venue, now);
  const remainingMs = Math.max(0, ops.kickoffAt - now);
  const countdown = `${Math.floor(remainingMs / 60000)}:${pad(Math.floor((remainingMs % 60000) / 1000))}`;

  return (
    <section className="ops" aria-labelledby="ops-heading">
      <div className="ops__top">
        <h2 id="ops-heading" className="ops__heading">
          {ui.ops.heading}
        </h2>
        <span className="ops__weather">
          <WeatherIcon weather={ops.weather} />
          <span className="tabular">{ops.temperatureC}°C</span>
          <span className="visually-hidden">{weatherLabel(ops.weather, ui)}</span>
        </span>
      </div>

      <div className={`ops__clock ops__clock--${ops.phase}`}>
        {ops.phase === 'pre' ? (
          <>
            <span className="ops__clock-label">{ui.ops.preMatch}</span>
            <span className="ops__clock-value display tabular">{countdown}</span>
          </>
        ) : ops.phase === 'live' ? (
          <>
            <span className="ops__live">
              <span className="ops__live-dot" aria-hidden="true" />
              {ui.ops.live}
            </span>
            <span className="ops__clock-value display tabular">{ops.matchClock}&apos;</span>
          </>
        ) : (
          <span className="ops__clock-value display">{ui.ops.postMatch}</span>
        )}
      </div>

      <div className="ops__gates">
        <p className="ops__gates-heading">{ui.ops.gatesHeading}</p>
        <ul>
          {ops.gates.map((gate) => {
            const pct = Math.round(gate.occupancy * 100);
            return (
              <li key={gate.gateId} className="ops__gate">
                <span className="ops__gate-id">
                  {ui.ops.gate} {gate.gateId}
                </span>
                <span
                  className={`meter meter--${gate.level}`}
                  role="meter"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={pct}
                  aria-label={`${ui.ops.gate} ${gate.gateId}: ${levelLabel(gate.level, ui)}, ${pct}%`}
                >
                  <span className="meter__fill" style={{ width: `${pct}%` }} />
                </span>
                <span className="ops__gate-queue tabular">
                  {ui.ops.queue.replace('{min}', String(gate.queueMinutes))}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
