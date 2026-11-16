import { useShellStore } from '@agentos/core/shell/lib';
import type { ExtensionEntry } from '@agentos/core/shell/lib';

/** Extension Manager catalog entries. */
export function useShellExtensions(): ExtensionEntry[] {
  return useShellStore((s) => s.extensions);
}
