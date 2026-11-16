import { SidebarSimpleIcon } from '@phosphor-icons/react';
import { useShellSidebarOpen } from '@agentos/core/shell/hooks';
import { useShellStore } from '@agentos/core/shell/lib';
import { Button } from '@agentos/ui/components/button';
import { config as agentosConfig } from 'virtual:agentos-config';

export type TopBarProps = {
  /** Override store / config values (SSR / tests). */
  sidebarOpen?: boolean;
  appName?: string;
  logoUrl?: string;
};

/**
 * Shell topbar chrome — full-width strip above the workspace row.
 *
 * Regions `top-bar-start` / `top-bar-center` / `top-bar-end` are reserved
 * **global** UI contribution hosts (symmetric to status-bar main/end).
 * v1 owns the controls inside them; extension contributions come later.
 * Settings opens via Activity Bar secondary (builtin `settings`).
 */
export function TopBar(props: TopBarProps = {}) {
  const {
    sidebarOpen: sidebarOpenProp,
    appName: appNameProp,
    logoUrl: logoUrlProp,
  } = props;
  const sidebarOpen = useShellSidebarOpen(sidebarOpenProp);
  const toggleSidebar = useShellStore((s) => s.toggleSidebar);

  const appName = appNameProp ?? agentosConfig.branding.appName;
  const logoUrl =
    logoUrlProp !== undefined ? logoUrlProp : agentosConfig.branding.logoUrl;

  return (
    <header
      className="flex h-10 shrink-0 items-center gap-2 border-b border-border bg-sidebar px-2.5 text-sm text-foreground"
      aria-label="Top bar"
      data-slot="top-bar"
    >
      <div
        className="flex shrink-0 items-center gap-1"
        data-slot="top-bar-start"
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground"
          data-slot="topbar-sidebar-toggle"
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          aria-pressed={sidebarOpen}
          onClick={() => toggleSidebar()}
        >
          <SidebarSimpleIcon className="size-4" weight="regular" />
        </Button>
      </div>

      <div
        className="flex min-w-0 flex-1 items-center justify-center gap-2 overflow-hidden"
        data-slot="top-bar-center"
      >
        {logoUrl ? (
          <img
            src={logoUrl}
            alt=""
            className="h-6 w-auto max-w-[8rem] object-contain"
            data-slot="topbar-logo"
          />
        ) : null}
        <span
          className="truncate font-medium text-foreground"
          data-slot="topbar-app-name"
        >
          {appName}
        </span>
      </div>

      <div
        className="flex shrink-0 items-center gap-1"
        data-slot="top-bar-end"
      />
    </header>
  );
}
