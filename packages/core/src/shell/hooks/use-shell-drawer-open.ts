import { useShellStore } from '@agentos/core/shell/lib';

/** Whether the Extension Manager sheet is open. */
export function useShellDrawerOpen(): boolean {
  return useShellStore((s) => s.drawerOpen);
}
