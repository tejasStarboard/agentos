import { beforeEach, describe, expect, test } from 'bun:test';
import {
  createShellHostApi,
  defaultEnabledById,
  defaultSkillsByExtension,
  resetShellHostApiStorage,
  STUB_EXTENSION_CATALOG,
  useShellStore,
} from '@agentos/core/shell/lib';

function resetStore() {
  useShellStore.setState({
    activeView: 'home',
    sidebarOpen: true,
    drawerOpen: false,
    extensions: STUB_EXTENSION_CATALOG,
    enabledById: defaultEnabledById(),
    desiredContributions: [],
    contributions: [],
    runtimeStatus: {},
    desiredSkillsByExtension: defaultSkillsByExtension(),
    skillsByExtension: defaultSkillsByExtension(),
    statusText: null,
    statusTone: null,
  });
}

describe('createShellHostApi notifications', () => {
  beforeEach(() => {
    resetStore();
    resetShellHostApiStorage();
  });

  test('notifications.show updates status text and tone', async () => {
    const host = createShellHostApi('crm');
    await host.notifications.show('saved', 'success');

    const state = useShellStore.getState();
    expect(state.statusText).toBe('saved');
    expect(state.statusTone).toBe('success');
  });

  test('notifications.show defaults type to info', async () => {
    const host = createShellHostApi('crm');
    await host.notifications.show('hello');

    const state = useShellStore.getState();
    expect(state.statusText).toBe('hello');
    expect(state.statusTone).toBe('info');
  });

  test('api.fetch proxies to /api/ext/:extensionId', async () => {
    const originalFetch = globalThis.fetch;
    const calls: string[] = [];
    globalThis.fetch = (async (input: RequestInfo | URL) => {
      calls.push(String(input));
      return new Response('{"ok":true}', { status: 200 });
    }) as typeof fetch;

    try {
      const host = createShellHostApi('auth');
      const res = await host.api.fetch('/session');
      expect(calls).toEqual(['/api/ext/auth/session']);
      expect(res).toEqual({ ok: true, status: 200, body: '{"ok":true}' });
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
