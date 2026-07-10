/**
 * Visually-hidden polite live region. Announces transient broadcast events
 * (goals, gate alerts, mode changes) to screen readers without stealing focus.
 */
export function LiveRegion({ message }: { message: string }) {
  return (
    <div aria-live="polite" aria-atomic="true" className="sr-only" role="status">
      {message}
    </div>
  );
}
