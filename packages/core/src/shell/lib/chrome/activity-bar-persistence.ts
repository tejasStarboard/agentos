import { buildActivityBarSections } from './build-activity-bar-items';
import type { SidebarPanel, ShellView } from './store';
import { useShellStore } from './store';

export const ACTIVITY_BAR_STORAGE_KEY = 'agentos-shell-activity';

export type StoredActivitySelection = {
  view: ShellView;
  panel: SidebarPanel;
};

function canUseLocalStorage(): boolean {
  return typeof localStorage !== 'undefined';
}

/** Read last Activity Bar selection (view + sidebar panel). */
export function readStoredActivity(): StoredActivitySelection | null {
  if (!canUseLocalStorage()) return null;
  try {
    const raw = localStorage.getItem(ACTIVITY_BAR_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredActivitySelection>;
    if (typeof parsed.view !== 'string') return null;
    const panel = parsed.panel;
    if (
      panel !== 'contribution' &&
      panel !== 'extensions' &&
      panel !== 'hitl'
    ) {
      return null;
    }
    return { view: parsed.view, panel };
  } catch {
    return null;
  }
}

/** Persist last Activity Bar selection. */
export function writeStoredActivity(selection: StoredActivitySelection): void {
  if (!canUseLocalStorage()) return;
  try {
    localStorage.setItem(ACTIVITY_BAR_STORAGE_KEY, JSON.stringify(selection));
  } catch {
    // Quota / private mode — ignore.
  }
}

/**
 * Apply a stored selection to the Shell store when the target is still a
 * valid Activity Bar item (enabled + present). Falls back quietly otherwise.
 */
export function restoreStoredActivity(): StoredActivitySelection | null {
  const stored = readStoredActivity();
  if (!stored) return null;

  const state = useShellStore.getState();
  const { primary, secondary } = buildActivityBarSections({
    extensions: state.extensions,
    enabledById: state.enabledById,
    contributions: state.contributions,
  });
  const items = [...primary, ...secondary];

  const viewAllowed = items.some(
    (item) => item.panel == null && item.id === stored.view,
  );
  const panelAllowed =
    stored.panel === 'contribution' ||
    items.some((item) => item.panel === stored.panel);

  if (!viewAllowed && !panelAllowed) return null;

  if (viewAllowed) {
    state.setActiveView(stored.view);
  }

  if (panelAllowed && stored.panel !== 'contribution') {
    state.setSidebarPanel(stored.panel);
  }

  return {
    view: viewAllowed ? stored.view : useShellStore.getState().activeView,
    panel: panelAllowed ? stored.panel : useShellStore.getState().sidebarPanel,
  };
}
