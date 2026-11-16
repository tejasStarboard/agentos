import type { ShellView, SidebarPanel } from '../chrome/store';
import type { UiContribution } from './contribution';

export type SidebarColumnVisibleInput = {
  sidebarOpen: boolean;
  sidebarPanel: SidebarPanel;
  activeView: ShellView;
  /** Sidebar contributions (`view: 'sidebar'`). */
  sidebars: UiContribution[];
  /** App Home sidebar from `mountShell({ dashboardSidebar })`. */
  hasDashboardSidebar: boolean;
};

/**
 * Whether ShellRoot should allocate the left sidebar column.
 *
 * Active-extension host: in contribution mode, hide when the active view has
 * nothing to show (no Home `dashboardSidebar`, no matching `ui/sidebar.tsx`).
 * Shell panels (extensions / hitl) still show when `sidebarOpen`.
 */
export function sidebarColumnVisible({
  sidebarOpen,
  sidebarPanel,
  activeView,
  sidebars,
  hasDashboardSidebar,
}: SidebarColumnVisibleInput): boolean {
  if (!sidebarOpen) return false;
  if (sidebarPanel !== 'contribution') return true;
  if (activeView === 'home' && hasDashboardSidebar) return true;
  return sidebars.some((c) => c.extensionId === activeView);
}
