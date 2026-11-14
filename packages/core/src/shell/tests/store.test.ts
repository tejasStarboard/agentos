import { beforeEach, describe, expect, test } from 'bun:test';
import { useShellStore } from '@agentos/core/shell/lib';

describe('useShellStore', () => {
  beforeEach(() => {
    useShellStore.setState({
      activeView: 'home',
      sidebarOpen: true,
      drawerOpen: false,
      contributions: [],
      runtimeStatus: {},
    });
  });

  test('defaults to home with sidebar open', () => {
    const state = useShellStore.getState();
    expect(state.activeView).toBe('home');
    expect(state.sidebarOpen).toBe(true);
    expect(state.drawerOpen).toBe(false);
    expect(state.contributions).toEqual([]);
    expect(state.runtimeStatus).toEqual({});
  });

  test('setContributions and setRuntimeStatus track iframe host state', () => {
    useShellStore
      .getState()
      .setContributions([
        { extensionId: 'crm', view: 'page', src: '/crm.html' },
      ]);
    useShellStore.getState().setRuntimeStatus('crm', 'page', 'loading');
    useShellStore.getState().setRuntimeStatus('crm', 'page', 'active');

    const state = useShellStore.getState();
    expect(state.contributions).toHaveLength(1);
    expect(state.runtimeStatus['crm:page']).toBe('active');
  });

  test('crashed status does not clear sibling contributions', () => {
    useShellStore.getState().setContributions([
      { extensionId: 'a', view: 'page', src: '/a.html' },
      { extensionId: 'b', view: 'page', src: '/b.html' },
    ]);
    useShellStore.getState().setRuntimeStatus('a', 'page', 'crashed');
    useShellStore.getState().setRuntimeStatus('b', 'page', 'active');

    const state = useShellStore.getState();
    expect(state.contributions).toHaveLength(2);
    expect(state.runtimeStatus['a:page']).toBe('crashed');
    expect(state.runtimeStatus['b:page']).toBe('active');
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
