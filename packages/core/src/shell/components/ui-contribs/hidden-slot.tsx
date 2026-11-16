/**
 * Offscreen park marker for background iframes.
 * Page contributions park in-place inside MainCanvas (`hidden`) so view
 * switches do not remount / re-handshake; this slot keeps the shell contract
 * `data-slot="hidden"` for layout tests and future non-page parks.
 */
export function HiddenSlot() {
  return <div className="sr-only" data-slot="hidden" aria-hidden="true" />;
}
