import { createRoot, type Root } from 'react-dom/client';
import { registry as virtualRegistry } from 'virtual:agentos-registry';
import type { RegistryModel } from '@agentos/core/vite/lib/types';
import { ShellRoot } from './components/shell-root';
import { applyRegistry } from './lib/apply-registry';

let activeRoot: Root | null = null;

export type MountShellOptions = {
  /**
   * Override the Vite virtual registry (tests / non-Vite hosts).
   * Defaults to `import { registry } from 'virtual:agentos-registry'`.
   */
  registry?: RegistryModel;
};

/** Mount the Core Shell workspace into `root`. */
export function mountShell(
  root: HTMLElement,
  options: MountShellOptions = {},
): void {
  applyRegistry(options.registry ?? virtualRegistry);

  if (activeRoot) {
    activeRoot.unmount();
    activeRoot = null;
  }
  activeRoot = createRoot(root);
  activeRoot.render(<ShellRoot />);
}
