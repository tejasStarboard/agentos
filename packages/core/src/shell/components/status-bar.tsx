import { Badge } from '@agentos/ui/components/badge';
import { useShellStore } from '../lib/store';

/** Status bar chrome — richer badges land in ticket 9. */
export function StatusBar() {
  const activeView = useShellStore((s) => s.activeView);
  const drawerOpen = useShellStore((s) => s.drawerOpen);

  return (
    <footer
      className="flex h-6 shrink-0 items-center gap-2 border-t border-border bg-sidebar px-2.5 text-xs text-muted-foreground"
      aria-label="Status bar"
    >
      <span className="font-medium text-foreground">AgentOS</span>
      <Badge variant="outline">view: {activeView}</Badge>
      <Badge variant="secondary">
        {drawerOpen ? 'drawer open' : 'drawer closed'}
      </Badge>
    </footer>
  );
}
