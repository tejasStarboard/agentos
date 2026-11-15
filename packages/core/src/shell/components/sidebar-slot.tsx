import {
  useShellActiveView,
  useShellContributions,
  useShellDrawerOpen,
  useShellHitlInboxOpen,
  useShellSidebarOpen,
} from '@agentos/core/shell/hooks';
import {
  contributionKey,
  type ShellView,
  type UiContribution,
} from '@agentos/core/shell/lib';
import { Separator } from '@agentos/ui/components/separator';
import { cn } from '@agentos/ui/lib/utils';
import { ExtensionFrame } from './extension-frame';
import { ExtensionManagerPanel } from './extension-manager-drawer';
import { HitlInbox } from './hitl-inbox';

export type SidebarSlotProps = {
  contributions?: UiContribution[];
  sidebarOpen?: boolean;
  /** Override store active view (tests / controlled hosts). */
  activeView?: ShellView;
  drawerOpen?: boolean;
  hitlInboxOpen?: boolean;
};

type SidebarPanelMode = 'extensions' | 'hitl' | 'contribution';

function panelTitle(mode: SidebarPanelMode): string {
  if (mode === 'extensions') return 'Extensions';
  if (mode === 'hitl') return 'Approvals';
  return 'Sidebar';
}

/** Left sidebar host: active extension `ui/sidebar.tsx`, or Shell manager/HITL. */
export function SidebarSlot({
  contributions: contributionsProp,
  sidebarOpen: sidebarOpenProp,
  activeView: activeViewProp,
  drawerOpen: drawerOpenProp,
  hitlInboxOpen: hitlInboxOpenProp,
}: SidebarSlotProps) {
  const sidebarOpen = useShellSidebarOpen(sidebarOpenProp);
  const activeView = useShellActiveView(activeViewProp);
  const storeDrawerOpen = useShellDrawerOpen();
  const storeHitlInboxOpen = useShellHitlInboxOpen();
  const drawerOpen = drawerOpenProp ?? storeDrawerOpen;
  const hitlInboxOpen = hitlInboxOpenProp ?? storeHitlInboxOpen;
  const sidebars = useShellContributions({
    contributions: contributionsProp,
    view: 'sidebar',
  });

  const mode: SidebarPanelMode = drawerOpen
    ? 'extensions'
    : hitlInboxOpen
      ? 'hitl'
      : 'contribution';

  const contributionMode = mode === 'contribution';

  return (
    <aside
      className={cn(
        'flex h-full min-h-0 w-64 shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground',
        !sidebarOpen && 'hidden',
      )}
      data-slot="sidebar"
      data-sidebar-panel={mode}
      data-open={sidebarOpen ? 'true' : 'false'}
      aria-label="Sidebar"
      hidden={!sidebarOpen}
    >
      <div className="flex h-9 items-center px-3 text-xs font-medium text-muted-foreground">
        {panelTitle(mode)}
      </div>
      <Separator />
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
          {sidebars.length === 0 ? (
            <div className="p-3 text-xs text-muted-foreground">
              Sidebar slot
            </div>
          ) : (
            sidebars.map((contribution) => {
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
            })
          )}
          {sidebars.length > 0 &&
          !sidebars.some((c) => c.extensionId === activeView) ? (
            <div className="p-3 text-xs text-muted-foreground">
              Sidebar slot
            </div>
          ) : null}
        </div>
      ) : null}
    </aside>
  );
}
