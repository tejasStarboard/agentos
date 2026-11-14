import { ScrollArea } from '@agentos/ui/components/scroll-area';
import { Separator } from '@agentos/ui/components/separator';
import { cn } from '@agentos/ui/lib/utils';
import { useShellStore } from '../lib/store';

/** Left sidebar contribution slot (`ui/sidebar.tsx` in later tickets). */
export function SidebarSlot() {
  const sidebarOpen = useShellStore((s) => s.sidebarOpen);

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
        <div className="p-3 text-xs text-muted-foreground">Sidebar slot</div>
      </ScrollArea>
    </aside>
  );
}
