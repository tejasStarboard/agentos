/** Offscreen park for background iframes (wired in ticket 6). */
export function HiddenSlot() {
  return <div className="sr-only" data-slot="hidden" aria-hidden="true" />;
}
