import { MoonIcon, SunIcon } from '@phosphor-icons/react';
import { useShellActiveView } from '@agentos/core/shell/hooks';
import {
  useShellStore,
  type ContributionRuntimeStatus,
  type ExtensionEntry,
} from '@agentos/core/shell/lib';
import type { NotificationType } from '@agentos/core/sdk';
import { Badge } from '@agentos/ui/components/badge';
import { Button } from '@agentos/ui/components/button';
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

function countRuntime(
  runtimeStatus: Record<string, string>,
  status: string,
): number {
  return Object.values(runtimeStatus).filter((s) => s === status).length;
}

export type StatusBarProps = {
  /** Override store values (SSR / tests). */
  extensions?: ExtensionEntry[];
  enabledById?: Record<string, boolean>;
  runtimeStatus?: Record<string, ContributionRuntimeStatus>;
  statusText?: string | null;
  statusTone?: NotificationType | null;
};

/** Status bar chrome with notification text and runtime badges. */
export function StatusBar(props: StatusBarProps = {}) {
  const {
    extensions: extensionsProp,
    enabledById: enabledByIdProp,
    runtimeStatus: runtimeStatusProp,
    statusText: statusTextProp,
    statusTone: statusToneProp,
  } = props;
  const activeView = useShellActiveView();
  const drawerOpen = useShellStore((s) => s.drawerOpen);
  const chatOpen = useShellStore((s) => s.chatOpen);
  const toggleChat = useShellStore((s) => s.toggleChat);
  const storeStatusText = useShellStore((s) => s.statusText);
  const storeStatusTone = useShellStore((s) => s.statusTone);
  const storeEnabledById = useShellStore((s) => s.enabledById);
  const storeExtensions = useShellStore((s) => s.extensions);
  const storeRuntimeStatus = useShellStore((s) => s.runtimeStatus);

  const statusText =
    statusTextProp !== undefined ? statusTextProp : storeStatusText;
  const statusTone =
    statusToneProp !== undefined ? statusToneProp : storeStatusTone;
  const enabledById = enabledByIdProp ?? storeEnabledById;
  const extensions = extensionsProp ?? storeExtensions;
  const runtimeStatus = runtimeStatusProp ?? storeRuntimeStatus;

  const enabledCustomers = extensions.filter(
    (e) => e.kind === 'customer' && enabledById[e.id] !== false,
  ).length;
  const customerTotal = extensions.filter((e) => e.kind === 'customer').length;
  const loadingCount = countRuntime(runtimeStatus, 'loading');
  const crashedCount = countRuntime(runtimeStatus, 'crashed');

  return (
    <footer
      className="flex h-6 shrink-0 items-center gap-2 border-t border-border bg-sidebar px-2.5 text-xs text-muted-foreground"
      aria-label="Status bar"
      data-slot="status-bar"
    >
      <span className="font-medium text-foreground">AgentOS</span>
      <Badge variant="outline">view: {activeView}</Badge>
      <Badge variant="secondary">
        {drawerOpen ? 'drawer open' : 'drawer closed'}
      </Badge>
      <Badge variant="outline" data-slot="status-enabled">
        enabled: {enabledCustomers}/{customerTotal}
      </Badge>
      {loadingCount > 0 ? (
        <Badge variant="secondary" data-slot="status-loading">
          loading: {loadingCount}
        </Badge>
      ) : null}
      {crashedCount > 0 ? (
        <Badge variant="destructive" data-slot="status-crashed">
          crashed: {crashedCount}
        </Badge>
      ) : null}
      {statusText ? (
        <span
          className="min-w-0 truncate text-foreground"
          data-slot="status-text"
          data-tone={statusTone ?? undefined}
          title={statusText}
        >
          {statusText}
        </span>
      ) : null}
      <Button
        type="button"
        variant={chatOpen ? 'secondary' : 'ghost'}
        size="xs"
        className="h-5 px-1.5 text-[11px]"
        data-slot="status-chat-toggle"
        aria-pressed={chatOpen}
        onClick={() => toggleChat()}
      >
        Chat
      </Button>
      <EnsureMounted>
        <ThemeToggle />
      </EnsureMounted>
    </footer>
  );
}
