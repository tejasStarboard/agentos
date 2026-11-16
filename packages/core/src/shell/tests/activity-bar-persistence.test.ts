import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import {
  ACTIVITY_BAR_STORAGE_KEY,
  defaultEnabledById,
  readStoredActivity,
  restoreStoredActivity,
  STUB_EXTENSION_CATALOG,
  useShellStore,
  writeStoredActivity,
  type UiContribution,
} from '@agentos/core/shell/lib';

const pageContributions: UiContribution[] = [
  { extensionId: 'crm', view: 'page', src: '/__agentos/ext/crm/page.html' },
  {
    extensionId: 'invoices',
    view: 'page',
    src: '/__agentos/ext/invoices/page.html',
  },
  { extensionId: 'auth', view: 'page', src: '/__agentos/ext/auth/page.html' },
];

const memory = new Map<string, string>();

function installMemoryStorage() {
  memory.clear();
  const storage = {
    getItem(key: string) {
      return memory.has(key) ? memory.get(key)! : null;
    },
    setItem(key: string, value: string) {
      memory.set(key, value);
    },
    removeItem(key: string) {
      memory.delete(key);
    },
    clear() {
      memory.clear();
    },
    key() {
      return null;
    },
    get length() {
      return memory.size;
    },
  };
  Object.defineProperty(globalThis, 'localStorage', {
    value: storage,
    configurable: true,
  });
}

function resetStore() {
  useShellStore.setState({
    activeView: 'home',
    sidebarOpen: true,
    sidebarPanel: 'contribution',
    extensions: STUB_EXTENSION_CATALOG,
    enabledById: defaultEnabledById(),
    desiredContributions: pageContributions,
    contributions: pageContributions,
    runtimeStatus: {},
    desiredSkillsByExtension: {},
    skillsByExtension: {},
    statusText: null,
    statusTone: null,
  });
}

describe('activity-bar-persistence', () => {
  beforeEach(() => {
    installMemoryStorage();
    resetStore();
  });

  afterEach(() => {
    memory.clear();
    resetStore();
  });

  test('writeStoredActivity / readStoredActivity round-trip', () => {
    writeStoredActivity({ view: 'crm', panel: 'contribution' });
    expect(readStoredActivity()).toEqual({
      view: 'crm',
      panel: 'contribution',
    });
    expect(memory.get(ACTIVITY_BAR_STORAGE_KEY)).toContain('crm');
  });

  test('restoreStoredActivity restores last view instead of home', () => {
    writeStoredActivity({ view: 'crm', panel: 'contribution' });
    const restored = restoreStoredActivity();
    expect(restored).toEqual({ view: 'crm', panel: 'contribution' });
    expect(useShellStore.getState().activeView).toBe('crm');
    expect(useShellStore.getState().sidebarPanel).toBe('contribution');
  });

  test('restoreStoredActivity restores shell panel selection', () => {
    writeStoredActivity({ view: 'home', panel: 'extensions' });
    restoreStoredActivity();
    expect(useShellStore.getState().activeView).toBe('home');
    expect(useShellStore.getState().sidebarPanel).toBe('extensions');
    expect(useShellStore.getState().sidebarOpen).toBe(true);
  });

  test('restoreStoredActivity ignores unknown views', () => {
    writeStoredActivity({ view: 'missing-ext', panel: 'contribution' });
    restoreStoredActivity();
    expect(useShellStore.getState().activeView).toBe('home');
  });

  test('restoreStoredActivity ignores disabled extension views', () => {
    useShellStore.setState({
      enabledById: { ...defaultEnabledById(), crm: false },
      contributions: pageContributions.filter((c) => c.extensionId !== 'crm'),
    });
    writeStoredActivity({ view: 'crm', panel: 'contribution' });
    restoreStoredActivity();
    expect(useShellStore.getState().activeView).toBe('home');
  });
});
