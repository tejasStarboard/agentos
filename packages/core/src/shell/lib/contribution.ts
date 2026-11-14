/** UI contribution view kinds (maps to `ui/page|sidebar|widget.tsx`). */
export type ExtensionView = 'page' | 'sidebar' | 'widget';

/** Runtime lifecycle status for one mounted contribution frame. */
export type ContributionRuntimeStatus = 'loading' | 'active' | 'crashed';

/**
 * Declares a sandboxed iframe the Shell should mount.
 * `src` is typically `/__agentos/ext/<id>/<view>.html` (ticket 12);
 * `ExtensionFrame` appends `?theme=` from the Shell theme.
 */
export type UiContribution = {
  extensionId: string;
  view: ExtensionView;
  src: string;
};

/** Stable key for runtime status maps. */
export function contributionKey(
  extensionId: string,
  view: ExtensionView,
): string {
  return `${extensionId}:${view}`;
}
