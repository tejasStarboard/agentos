import { useShellStore } from '@agentos/core/shell/lib';

/**
 * Resolves sidebar open state from an optional override or the store.
 */
export function useShellSidebarOpen(override?: boolean): boolean {
  const storeSidebarOpen = useShellStore((s) => s.sidebarOpen);
  return override ?? storeSidebarOpen;
}
