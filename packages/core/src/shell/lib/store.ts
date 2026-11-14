import { create } from 'zustand';
import type { NotificationType } from '@agentos/core/sdk';
import type { ContributionRuntimeStatus, UiContribution } from './contribution';
import { contributionKey } from './contribution';
import {
  defaultEnabledById,
  defaultSkillsByExtension,
  STUB_EXTENSION_CATALOG,
  STUB_SKILLS_BY_EXTENSION,
  type ExtensionEntry,
} from './extension-catalog';
import { requestExtensionEnable } from './extension-enable';

export type ShellView = 'home' | (string & {});

function filterContributions(
  desired: UiContribution[],
  enabledById: Record<string, boolean>,
): UiContribution[] {
  return desired.filter((c) => enabledById[c.extensionId] !== false);
}

export type ShellUiState = {
  activeView: ShellView;
  sidebarOpen: boolean;
  drawerOpen: boolean;
  /** Catalog entries shown in Extension Manager (stub until ticket 11). */
  extensions: ExtensionEntry[];
  /** Per-extension enable flag; builtins stay true. */
  enabledById: Record<string, boolean>;
  /**
   * Desired UI contributions (all known mounts).
   * `contributions` is the enabled subset actually mounted.
   */
  desiredContributions: UiContribution[];
  contributions: UiContribution[];
  runtimeStatus: Record<string, ContributionRuntimeStatus>;
  /** Skills contributed per extension (palette wiring). */
  skillsByExtension: Record<string, string[]>;
  /** Latest notification / status line for the status bar. */
  statusText: string | null;
  statusTone: NotificationType | null;
  setActiveView: (view: ShellView) => void;
  setSidebarOpen: (open: boolean) => void;
  setDrawerOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  toggleDrawer: () => void;
  setExtensions: (extensions: ExtensionEntry[]) => void;
  setContributions: (contributions: UiContribution[]) => void;
  setRuntimeStatus: (
    extensionId: string,
    view: UiContribution['view'],
    status: ContributionRuntimeStatus,
  ) => void;
  setExtensionSkills: (extensionId: string, skills: string[]) => void;
  setExtensionEnabled: (extensionId: string, enabled: boolean) => void;
  setStatusText: (text: string | null, tone?: NotificationType | null) => void;
};

export const useShellStore = create<ShellUiState>((set, get) => ({
  activeView: 'home',
  sidebarOpen: true,
  drawerOpen: false,
  extensions: STUB_EXTENSION_CATALOG,
  enabledById: defaultEnabledById(),
  desiredContributions: [],
  contributions: [],
  runtimeStatus: {},
  skillsByExtension: defaultSkillsByExtension(),
  statusText: null,
  statusTone: null,
  setActiveView: (view) => set({ activeView: view }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setDrawerOpen: (open) => set({ drawerOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  toggleDrawer: () => set((s) => ({ drawerOpen: !s.drawerOpen })),
  setExtensions: (extensions) =>
    set((s) => {
      const enabledById = {
        ...defaultEnabledById(extensions),
        ...s.enabledById,
      };
      for (const ext of extensions) {
        if (!ext.toggleable) enabledById[ext.id] = true;
        if (enabledById[ext.id] === undefined) enabledById[ext.id] = true;
      }
      return {
        extensions,
        enabledById,
        contributions: filterContributions(s.desiredContributions, enabledById),
      };
    }),
  setContributions: (desiredContributions) =>
    set((s) => ({
      desiredContributions,
      contributions: filterContributions(desiredContributions, s.enabledById),
    })),
  setRuntimeStatus: (extensionId, view, status) =>
    set((s) => ({
      runtimeStatus: {
        ...s.runtimeStatus,
        [contributionKey(extensionId, view)]: status,
      },
    })),
  setExtensionSkills: (extensionId, skills) =>
    set((s) => ({
      skillsByExtension: {
        ...s.skillsByExtension,
        [extensionId]: skills,
      },
    })),
  setStatusText: (text, tone = null) =>
    set({
      statusText: text,
      statusTone: text == null ? null : (tone ?? null),
    }),
  setExtensionEnabled: (extensionId, enabled) => {
    const entry = get().extensions.find((e) => e.id === extensionId);
    if (!entry || !entry.toggleable) return;

    set((s) => {
      const enabledById = { ...s.enabledById, [extensionId]: enabled };
      const skillsByExtension = { ...s.skillsByExtension };
      if (!enabled) {
        delete skillsByExtension[extensionId];
      } else if (STUB_SKILLS_BY_EXTENSION[extensionId]) {
        skillsByExtension[extensionId] = [
          ...STUB_SKILLS_BY_EXTENSION[extensionId],
        ];
      }
      const runtimeStatus = { ...s.runtimeStatus };
      if (!enabled) {
        for (const key of Object.keys(runtimeStatus)) {
          if (key.startsWith(`${extensionId}:`)) {
            delete runtimeStatus[key];
          }
        }
      }
      return {
        enabledById,
        skillsByExtension,
        runtimeStatus,
        contributions: filterContributions(s.desiredContributions, enabledById),
      };
    });

    void requestExtensionEnable(extensionId, enabled);
  },
}));
