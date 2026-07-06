/**
 * Visually-hidden polite live region. Fed the assistant's status ("typing…")
 * and final answer so screen-reader users hear the outcome without every
 * streamed token being announced.
 */
export function LiveRegion({ message }: { message: string }) {
  return (
    <div role="status" aria-live="polite" aria-atomic="true" className="visually-hidden">
      {message}
    </div>
  );
}
