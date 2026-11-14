import { MoonIcon, SunIcon } from '@phosphor-icons/react';
import { useShellActiveView } from '@agentos/core/shell/hooks';
import { useShellStore } from '@agentos/core/shell/lib';
import { Badge } from '@agentos/ui/components/badge';
import { Switch } from '@agentos/ui/components/switch';
import { useTheme } from '@agentos/ui/components/theme-provider';
import { EnsureMounted } from './ensure-mounted';

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <div className="ml-auto flex items-center gap-1.5">
      <SunIcon
        className="size-3 dark:hidden"
        aria-hidden={isDark ? 'false' : 'true'}
      />
      <MoonIcon
        className="size-3 hidden dark:block"
        aria-hidden={isDark ? 'true' : 'false'}
      />
      <Switch
        size="sm"
        checked={isDark}
        aria-label="Toggle dark theme"
        title="Temporary theme toggle"
        onCheckedChange={(checked) => {
          setTheme(checked ? 'dark' : 'light');
        }}
      />
    </div>
  );
}

/** Status bar chrome — richer badges land in ticket 9. */
export function StatusBar() {
  const activeView = useShellActiveView();
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
      <EnsureMounted>
        <ThemeToggle />
      </EnsureMounted>
    </footer>
  );
}
