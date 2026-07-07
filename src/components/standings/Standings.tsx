import { motion } from 'framer-motion';
import { useFanContext } from '../../features/context/ContextProvider';
import { GROUP_STANDINGS } from '../../features/tournament/standings';
import { panelItem, rowItem, staggerContainer } from '../../lib/motion';

export function Standings() {
  const { ui, fixture } = useFanContext();
  const rows = GROUP_STANDINGS[fixture.group] ?? [];

  return (
    <motion.section className="standings" aria-labelledby="standings-heading" variants={panelItem}>
      <h2 id="standings-heading" className="standings__heading">
        {ui.standings.heading} — {fixture.group}
      </h2>
      <table className="standings__table">
        <thead>
          <tr>
            <th scope="col">
              <span className="visually-hidden">{ui.standings.heading}</span>
            </th>
            <th scope="col">{ui.standings.played}</th>
            <th scope="col">{ui.standings.points}</th>
          </tr>
        </thead>
        <motion.tbody
          key={fixture.group}
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          {rows.map((row) => (
            <motion.tr
              key={row.code}
              variants={rowItem}
              className={row.code === fixture.home.code || row.code === fixture.away.code ? 'is-playing' : ''}
            >
              <th scope="row">
                <span className="standings__code">{row.code}</span> {row.name}
              </th>
              <td className="tabular">{row.played}</td>
              <td className="tabular standings__pts">{row.points}</td>
            </motion.tr>
          ))}
        </motion.tbody>
      </table>
    </motion.section>
  );
}
