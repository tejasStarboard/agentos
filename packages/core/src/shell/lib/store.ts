import { create } from 'zustand';

export type ShellView = 'home' | (string & {});

export type ShellUiState = {
  activeView: ShellView;
  sidebarOpen: boolean;
  drawerOpen: boolean;
  setActiveView: (view: ShellView) => void;
  setSidebarOpen: (open: boolean) => void;
  setDrawerOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  toggleDrawer: () => void;
};

export const useShellStore = create<ShellUiState>((set) => ({
  activeView: 'home',
  sidebarOpen: true,
  drawerOpen: false,
  setActiveView: (view) => set({ activeView: view }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setDrawerOpen: (open) => set({ drawerOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  toggleDrawer: () => set((s) => ({ drawerOpen: !s.drawerOpen })),
}));
