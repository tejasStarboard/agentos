import {
  useShellContributions,
  useShellSidebarOpen,
} from '@agentos/core/shell/hooks';
import { contributionKey, type UiContribution } from '@agentos/core/shell/lib';
import { ScrollArea } from '@agentos/ui/components/scroll-area';
import { Separator } from '@agentos/ui/components/separator';
import { cn } from '@agentos/ui/lib/utils';
import { ExtensionFrame } from './extension-frame';

export type SidebarSlotProps = {
  contributions?: UiContribution[];
  sidebarOpen?: boolean;
};

/** Left sidebar contribution slot (`ui/sidebar.tsx`). */
export function SidebarSlot({
  contributions: contributionsProp,
  sidebarOpen: sidebarOpenProp,
}: SidebarSlotProps) {
  const sidebarOpen = useShellSidebarOpen(sidebarOpenProp);
  const sidebars = useShellContributions({
    contributions: contributionsProp,
    view: 'sidebar',
  });

  return (
    <aside
      className={cn(
        'w-64 shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground',
        !sidebarOpen && 'hidden',
      )}
      data-slot="sidebar"
      data-open={sidebarOpen ? 'true' : 'false'}
      aria-label="Sidebar"
      hidden={!sidebarOpen}
    >
      <div className="flex h-9 items-center px-3 text-xs font-medium text-muted-foreground">
        Sidebar
      </div>
      <Separator />
      <ScrollArea className="h-[calc(100%-2.25rem)]">
        {sidebars.length === 0 ? (
          <div className="p-3 text-xs text-muted-foreground">Sidebar slot</div>
        ) : (
          sidebars.map((contribution) => (
            <div
              key={contributionKey(contribution.extensionId, contribution.view)}
              className="h-48 w-full"
            >
              <ExtensionFrame
                contribution={contribution}
                visible={sidebarOpen}
              />
            </div>
          ))
        )}
      </ScrollArea>
    </aside>
  );
}
