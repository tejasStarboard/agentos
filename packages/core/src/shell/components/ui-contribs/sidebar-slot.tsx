import {
  useShellActiveView,
  useShellContributions,
  useShellSidebarOpen,
  useShellSidebarPanel,
} from '@agentos/core/shell/hooks';
import {
  contributionKey,
  type ShellView,
  type SidebarPanel,
  type UiContribution,
} from '@agentos/core/shell/lib';
import { cn } from '@agentos/ui/lib/utils';
import { ExtensionManagerPanel } from '../chrome/extension-manager-drawer';
import { HitlInbox } from '../chrome/hitl-inbox';
import { ExtensionFrame } from './extension-frame';

export type SidebarSlotProps = {
  contributions?: UiContribution[];
  sidebarOpen?: boolean;
  /** Override store active view (tests / controlled hosts). */
  activeView?: ShellView;
  /** Override store sidebar panel mode (tests / controlled hosts). */
  sidebarPanel?: SidebarPanel;
};

/** Left sidebar host: active extension `ui/sidebar.tsx`, or Shell manager/HITL. */
export function SidebarSlot({
  contributions: contributionsProp,
  sidebarOpen: sidebarOpenProp,
  activeView: activeViewProp,
  sidebarPanel: sidebarPanelProp,
}: SidebarSlotProps) {
  const sidebarOpen = useShellSidebarOpen(sidebarOpenProp);
  const activeView = useShellActiveView(activeViewProp);
  const storePanel = useShellSidebarPanel();
  const mode = sidebarPanelProp ?? storePanel;
  const sidebars = useShellContributions({
    contributions: contributionsProp,
    view: 'sidebar',
  });

  const contributionMode = mode === 'contribution';

  return (
    <aside
      className={cn(
        'flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden bg-sidebar text-sidebar-foreground',
        !sidebarOpen && 'hidden',
      )}
      data-slot="sidebar"
      data-sidebar-panel={mode}
      data-open={sidebarOpen ? 'true' : 'false'}
      aria-label="Sidebar"
      hidden={!sidebarOpen}
    >
      {mode === 'extensions' ? (
        <div className="min-h-0 flex-1 overflow-hidden">
          <ExtensionManagerPanel />
        </div>
      ) : null}
      {mode === 'hitl' ? (
        <div className="min-h-0 flex-1 overflow-hidden">
          <HitlInbox />
        </div>
      ) : null}
      {contributionMode ? (
        <div className="min-h-0 flex-1 overflow-hidden">
          {sidebars.map((contribution) => {
            const active = contribution.extensionId === activeView;
            return (
              <div
                key={contributionKey(
                  contribution.extensionId,
                  contribution.view,
                )}
                className={cn('h-full w-full', !active && 'hidden')}
                hidden={!active}
                data-sidebar-active={active ? 'true' : 'false'}
              >
                <ExtensionFrame
                  contribution={contribution}
                  visible={sidebarOpen && active}
                />
              </div>
            );
          })}
        </div>
      ) : null}
    </aside>
  );
}
