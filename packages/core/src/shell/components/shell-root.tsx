import type { ComponentType } from 'react';
import {
  useShellActiveView,
  useShellSidebarOpen,
} from '@agentos/core/shell/hooks';
import {
  AGENTOS_THEMES,
  ThemeProvider,
} from '@agentos/ui/components/theme-provider';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@agentos/ui/components/resizable';
import { Toaster, toast } from '@agentos/ui/components/toast';
import { ActivityBar } from './activity-bar';
import { ChatPanel } from './chat-panel';
import { CommandPalette } from './command-palette';
import { HiddenSlot } from './hidden-slot';
import { HomeDashboard } from './home-dashboard';
import { MainCanvas } from './main-canvas';
import { SidebarSlot } from './sidebar-slot';
import { StatusBar } from './status-bar';
import '@agentos/ui/globals.css';

export type ShellRootProps = {
  /** App-owned Home page from `ui/dashboard.tsx`. */
  dashboard?: ComponentType;
};

function MainWorkspace({
  isHome,
  dashboard,
}: {
  isHome: boolean;
  dashboard?: ComponentType;
}) {
  return (
    <div className="relative h-full min-h-0 min-w-0 overflow-hidden bg-background">
      <div
        className="h-full w-full overflow-auto"
        data-active={isHome ? 'true' : 'false'}
        hidden={!isHome}
      >
        <HomeDashboard dashboard={dashboard} />
      </div>
      <div
        className="h-full w-full overflow-auto"
        data-active={isHome ? 'false' : 'true'}
        hidden={isHome}
      >
        <MainCanvas />
      </div>
    </div>
  );
}

export function ShellRoot({ dashboard }: ShellRootProps = {}) {
  const activeView = useShellActiveView();
  const sidebarOpen = useShellSidebarOpen();
  const isHome = activeView === 'home';

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      storageKey="agentos-theme"
      themes={[...AGENTOS_THEMES]}
    >
      <Toaster toastManager={toast} position="top-center">
        <div
          className="flex h-dvh max-h-dvh w-full flex-col overflow-hidden bg-background text-foreground"
          data-agentos-shell
        >
          <div className="flex min-h-0 flex-1 overflow-hidden">
            <ActivityBar />
            {sidebarOpen ? (
              <ResizablePanelGroup
                orientation="horizontal"
                className="min-h-0 min-w-0 flex-1"
              >
                <ResizablePanel
                  id="shell-sidebar"
                  defaultSize={256}
                  minSize={180}
                  maxSize={480}
                  className="min-h-0"
                >
                  <SidebarSlot />
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel
                  id="shell-main"
                  defaultSize="70%"
                  minSize="40%"
                  className="min-h-0 min-w-0"
                >
                  <MainWorkspace isHome={isHome} dashboard={dashboard} />
                </ResizablePanel>
              </ResizablePanelGroup>
            ) : (
              <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
                <MainWorkspace isHome={isHome} dashboard={dashboard} />
              </div>
            )}
          </div>
          <StatusBar />
          <ChatPanel />
          <HiddenSlot />
          <CommandPalette />
        </div>
      </Toaster>
    </ThemeProvider>
  );
}
