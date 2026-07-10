import { motion } from 'framer-motion';
import { useFanContext } from '../../features/context/ContextProvider';
import { GROUP_STANDINGS } from '../../features/tournament/standings';
import { rowItem, staggerContainer } from '../../lib/motion';
import { Panel } from '../ui/Panel';
import { cn } from '../../lib/utils';

export function Standings() {
  const { ui, fixture } = useFanContext();
  const rows = (GROUP_STANDINGS[fixture.group] ?? []).slice().sort((a, b) => b.points - a.points);
  const playing = new Set([fixture.home.code, fixture.away.code]);

  return (
    <Panel eyebrow={ui.standings.heading} heading={fixture.group}>
      <motion.table
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="w-full border-collapse text-sm"
      >
        <thead>
          <tr className="hud-eyebrow text-left">
            <th className="w-6 pb-2 font-semibold">#</th>
            <th className="pb-2 font-semibold"><span className="sr-only">Team</span></th>
            <th className="pb-2 text-center font-semibold">{ui.standings.played}</th>
            <th className="pb-2 text-right font-semibold">{ui.standings.points}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const isPlaying = playing.has(r.code);
            return (
              <motion.tr
                key={r.code}
                variants={rowItem}
                className={cn(
                  'border-t border-[color-mix(in_oklab,var(--color-border)_60%,transparent)]',
                  isPlaying && 'bg-[color-mix(in_oklab,var(--color-accent)_8%,transparent)]',
                )}
              >
                <td className="tabular py-2 text-muted-foreground">{i + 1}</td>
                <td className="py-2">
                  <span className={cn('font-semibold', isPlaying ? 'text-accent' : 'text-foreground')}>
                    {r.code}
                  </span>
                  <span className="ml-2 hidden text-xs text-muted-foreground sm:inline">{r.name}</span>
                </td>
                <td className="tabular py-2 text-center text-muted-foreground">{r.played}</td>
                <td className="tabular py-2 text-right font-bold text-foreground">{r.points}</td>
              </motion.tr>
            );
          })}
        </tbody>
      </motion.table>
    </Panel>
  );
}
