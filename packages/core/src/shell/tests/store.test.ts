import { beforeEach, describe, expect, test } from 'bun:test';
import { useShellStore } from '../lib/store';

describe('useShellStore', () => {
  beforeEach(() => {
    useShellStore.setState({
      activeView: 'home',
      sidebarOpen: true,
      drawerOpen: false,
    });
  });

  test('defaults to home with sidebar open', () => {
    const state = useShellStore.getState();
    expect(state.activeView).toBe('home');
    expect(state.sidebarOpen).toBe(true);
    expect(state.drawerOpen).toBe(false);
  });

  test('setActiveView updates active view', () => {
    useShellStore.getState().setActiveView('ext-placeholder');
    expect(useShellStore.getState().activeView).toBe('ext-placeholder');
  });

  test('toggleSidebar and setDrawerOpen flip drawer flags', () => {
    useShellStore.getState().toggleSidebar();
    expect(useShellStore.getState().sidebarOpen).toBe(false);
    useShellStore.getState().setDrawerOpen(true);
    expect(useShellStore.getState().drawerOpen).toBe(true);
    useShellStore.getState().toggleDrawer();
    expect(useShellStore.getState().drawerOpen).toBe(false);
  });
});
