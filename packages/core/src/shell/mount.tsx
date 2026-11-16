import { createRoot, type Root } from 'react-dom/client';
import type { ComponentType } from 'react';
import { registry as virtualRegistry } from 'virtual:agentos-registry';
import type { RegistryModel } from '@agentos/core/vite/lib/types';
import { AuthGate, type AuthGateConfig } from './components/auth/auth-gate';
import { restoreStoredActivity } from './lib/chrome/activity-bar-persistence';
import { applyRegistry } from './lib/chrome/apply-registry';

let activeRoot: Root | null = null;

export type MountShellOptions = {
  /**
   * Override the Vite virtual registry (tests / non-Vite hosts).
   * Defaults to `import { registry } from 'virtual:agentos-registry'`.
   */
  registry?: RegistryModel;
  /**
   * App-owned Home page component (convention: `ui/dashboard.tsx` next to
   * `extensions/` / `services/`). Rendered in-process in the Shell Home pane.
   */
  dashboard?: ComponentType;
  /**
   * Override `virtual:agentos-config` (tests).
   */
  config?: AuthGateConfig;
};

/** Mount the Core Shell workspace into `root` (auth-gated). */
export function mountShell(
  root: HTMLElement,
  options: MountShellOptions = {},
): void {
  applyRegistry(options.registry ?? virtualRegistry);
  restoreStoredActivity();

  if (activeRoot) {
    activeRoot.unmount();
    activeRoot = null;
  }
  activeRoot = createRoot(root);
  activeRoot.render(
    <AuthGate dashboard={options.dashboard} config={options.config} />,
  );
}
