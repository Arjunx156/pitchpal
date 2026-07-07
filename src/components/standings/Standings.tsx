import { useFanContext } from '../../features/context/ContextProvider';
import { GROUP_STANDINGS } from '../../features/tournament/standings';

export function Standings() {
  const { ui, fixture } = useFanContext();
  const rows = GROUP_STANDINGS[fixture.group] ?? [];

  return (
    <section className="standings" aria-labelledby="standings-heading">
      <h2 id="standings-heading" className="standings__heading display">
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
        <tbody>
          {rows.map((row) => (
            <tr key={row.code} className={row.code === fixture.home.code || row.code === fixture.away.code ? 'is-playing' : ''}>
              <th scope="row">
                <span className="standings__code">{row.code}</span> {row.name}
              </th>
              <td className="tabular">{row.played}</td>
              <td className="tabular standings__pts">{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
