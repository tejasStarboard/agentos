import { useShellActiveView } from '@agentos/core/shell/hooks';
import {
  AGENTOS_THEMES,
  ThemeProvider,
} from '@agentos/ui/components/theme-provider';
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

export function ShellRoot() {
  const activeView = useShellActiveView();
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
            <SidebarSlot />
            <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden bg-background">
              <div
                className="h-full w-full overflow-auto"
                data-active={isHome ? 'true' : 'false'}
                hidden={!isHome}
              >
                <HomeDashboard />
              </div>
              <div
                className="h-full w-full overflow-auto"
                data-active={isHome ? 'false' : 'true'}
                hidden={isHome}
              >
                <MainCanvas />
              </div>
            </div>
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
