import { create } from 'zustand';
import type { ContributionRuntimeStatus, UiContribution } from './contribution';
import { contributionKey } from './contribution';

export type ShellView = 'home' | (string & {});

export type ShellUiState = {
  activeView: ShellView;
  sidebarOpen: boolean;
  drawerOpen: boolean;
  contributions: UiContribution[];
  runtimeStatus: Record<string, ContributionRuntimeStatus>;
  setActiveView: (view: ShellView) => void;
  setSidebarOpen: (open: boolean) => void;
  setDrawerOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  toggleDrawer: () => void;
  setContributions: (contributions: UiContribution[]) => void;
  setRuntimeStatus: (
    extensionId: string,
    view: UiContribution['view'],
    status: ContributionRuntimeStatus,
  ) => void;
};

export const useShellStore = create<ShellUiState>((set) => ({
  activeView: 'home',
  sidebarOpen: true,
  drawerOpen: false,
  contributions: [],
  runtimeStatus: {},
  setActiveView: (view) => set({ activeView: view }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setDrawerOpen: (open) => set({ drawerOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  toggleDrawer: () => set((s) => ({ drawerOpen: !s.drawerOpen })),
  setContributions: (contributions) => set({ contributions }),
  setRuntimeStatus: (extensionId, view, status) =>
    set((s) => ({
      runtimeStatus: {
        ...s.runtimeStatus,
        [contributionKey(extensionId, view)]: status,
      },
    })),
}));
