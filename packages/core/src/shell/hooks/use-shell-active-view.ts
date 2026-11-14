import { useShellStore, type ShellView } from '@agentos/core/shell/lib';

/**
 * Resolves the active shell view from an optional override or the store.
 */
export function useShellActiveView(override?: ShellView): ShellView {
  const storeActiveView = useShellStore((s) => s.activeView);
  return override ?? storeActiveView;
}
