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
});
