import { beforeEach, describe, expect, test } from 'bun:test';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { RegistryModel } from '@agentos/core/vite/lib/types';
import {
  applyRegistry,
  mapRegistry,
  useShellStore,
} from '@agentos/core/shell/lib';

const fixturesRoot = fileURLToPath(
  new URL('../../vite/tests/fixtures', import.meta.url),
);

function fixtureRegistry(): RegistryModel {
  return {
    scannedAt: 1,
    extensions: [
      {
        id: 'auth',
        kind: 'builtin',
        driven: true,
        toggleable: false,
        rootDir: join(fixturesRoot, 'builtins/auth'),
        name: 'Auth',
        meta: {},
        ui: { page: join(fixturesRoot, 'builtins/auth/ui/page.tsx') },
        uiEntries: { page: '/__agentos/ext/auth/page.html' },
        agent: {},
        agentDescriptors: { tools: [], skills: [] },
      },
      {
        id: 'crm',
        kind: 'customer',
        driven: false,
        toggleable: true,
        rootDir: join(fixturesRoot, 'extensions/crm'),
        name: 'CRM Helper',
        meta: {},
        ui: {
          page: join(fixturesRoot, 'extensions/crm/ui/page.tsx'),
          sidebar: join(fixturesRoot, 'extensions/crm/ui/sidebar.tsx'),
        },
        uiEntries: {
          page: '/__agentos/ext/crm/page.html',
          sidebar: '/__agentos/ext/crm/sidebar.html',
        },
        agent: {
          tools: join(fixturesRoot, 'extensions/crm/agent/tools.json'),
          skills: join(fixturesRoot, 'extensions/crm/agent/skills.ts'),
        },
        agentDescriptors: {
          tools: [{ name: 'search_contacts' }],
          skills: ['search-contacts'],
        },
      },
    ],
  };
}

describe('applyRegistry', () => {
  beforeEach(() => {
    useShellStore.setState({
      activeView: 'home',
      sidebarOpen: true,
      drawerOpen: false,
      extensions: [],
      enabledById: {},
      desiredContributions: [],
      contributions: [],
      runtimeStatus: {},
      desiredSkillsByExtension: {},
      skillsByExtension: {},
      statusText: null,
      statusTone: null,
    });
  });

  test('mapRegistry builds catalog, contributions, and skills', () => {
    const mapped = mapRegistry(fixtureRegistry());
    expect(mapped.extensions).toEqual([
      {
        id: 'auth',
        name: 'Auth',
        kind: 'builtin',
        toggleable: false,
        driven: true,
      },
      {
        id: 'crm',
        name: 'CRM Helper',
        kind: 'customer',
        toggleable: true,
        driven: false,
      },
    ]);
    expect(mapped.contributions).toEqual([
      {
        extensionId: 'auth',
        view: 'page',
        src: '/__agentos/ext/auth/page.html',
      },
      {
        extensionId: 'crm',
        view: 'page',
        src: '/__agentos/ext/crm/page.html',
      },
      {
        extensionId: 'crm',
        view: 'sidebar',
        src: '/__agentos/ext/crm/sidebar.html',
      },
    ]);
    expect(mapped.skillsByExtension).toEqual({
      crm: ['search-contacts'],
    });
  });

  test('applyRegistry seeds the shell store', () => {
    applyRegistry(fixtureRegistry());
    const state = useShellStore.getState();
    expect(state.extensions.map((e) => e.id)).toEqual(['auth', 'crm']);
    expect(state.enabledById.auth).toBe(true);
    expect(state.enabledById.crm).toBe(true);
    expect(state.contributions).toHaveLength(3);
    expect(state.skillsByExtension.crm).toEqual(['search-contacts']);
    expect(state.desiredSkillsByExtension.crm).toEqual(['search-contacts']);
  });
});
