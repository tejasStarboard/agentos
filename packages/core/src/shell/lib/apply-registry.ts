import type { RegistryModel } from '../../vite/lib/types';
import type { UiContribution } from './contribution';
import type { ExtensionEntry } from './extension-catalog';
import { useShellStore } from './store';

export type AppliedRegistry = {
  extensions: ExtensionEntry[];
  contributions: UiContribution[];
  skillsByExtension: Record<string, string[]>;
};

/** Map a registry model into Shell store slices (pure). */
export function mapRegistry(registry: RegistryModel): AppliedRegistry {
  const extensions: ExtensionEntry[] = registry.extensions.map((ext) => ({
    id: ext.id,
    name: ext.name,
    kind: ext.kind,
    toggleable: ext.toggleable,
    driven: ext.driven,
  }));

  const contributions: UiContribution[] = [];
  const skillsByExtension: Record<string, string[]> = {};

  for (const ext of registry.extensions) {
    for (const view of ['page', 'sidebar', 'widget'] as const) {
      const src = ext.uiEntries[view];
      if (src) {
        contributions.push({
          extensionId: ext.id,
          view,
          src,
        });
      }
    }
    const skills = ext.agentDescriptors.skills;
    if (skills.length > 0) {
      skillsByExtension[ext.id] = [...skills];
    }
  }

  return { extensions, contributions, skillsByExtension };
}

/** Seed the Shell store from `virtual:agentos-registry` (or a test fixture). */
export function applyRegistry(registry: RegistryModel): AppliedRegistry {
  const applied = mapRegistry(registry);
  const store = useShellStore.getState();
  store.setExtensions(applied.extensions);
  store.setContributions(applied.contributions);
  store.setDesiredSkills(applied.skillsByExtension);
  return applied;
}
