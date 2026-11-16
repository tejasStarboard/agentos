import { useShellStore, type SidebarPanel } from '@agentos/core/shell/lib';

export function useShellSidebarPanel(): SidebarPanel {
  return useShellStore((s) => s.sidebarPanel);
}
