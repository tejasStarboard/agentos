import { describe, expect, test } from 'bun:test';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  enrichExtension,
  enrichRegistry,
  uiEntryUrl,
} from '@agentos/core/vite/lib/enrich-registry';
import type { RegistryModel } from '@agentos/core/vite/lib/types';

describe('enrichRegistry', () => {
  test('uiEntryUrl uses /__agentos/ext convention', () => {
    expect(uiEntryUrl('crm', 'page')).toBe('/__agentos/ext/crm/page.html');
    expect(uiEntryUrl('auth', 'sidebar')).toBe(
      '/__agentos/ext/auth/sidebar.html',
    );
  });

  test('derives driven/toggleable and uiEntries from kind + ui paths', () => {
    const builtin = enrichExtension({
      id: 'auth',
      kind: 'builtin',
      rootDir: '/builtins/auth',
      name: 'Auth',
      meta: {},
      ui: { page: '/builtins/auth/ui/page.tsx' },
      agent: {},
    });
    expect(builtin.driven).toBe(true);
    expect(builtin.toggleable).toBe(false);
    expect(builtin.uiEntries).toEqual({
      page: '/__agentos/ext/auth/page.html',
    });
    expect(builtin.agentDescriptors).toEqual({ tools: [], skills: [] });

    const customer = enrichExtension({
      id: 'crm',
      kind: 'customer',
      rootDir: '/extensions/crm',
      name: 'CRM',
      meta: {},
      ui: {
        page: '/extensions/crm/ui/page.tsx',
        sidebar: '/extensions/crm/ui/sidebar.tsx',
      },
      agent: {},
    });
    expect(customer.driven).toBe(false);
    expect(customer.toggleable).toBe(true);
    expect(customer.uiEntries.page).toBe('/__agentos/ext/crm/page.html');
    expect(customer.uiEntries.sidebar).toBe('/__agentos/ext/crm/sidebar.html');
  });

  test('parses tools.json into agentDescriptors.tools', () => {
    const root = mkdtempSync(join(tmpdir(), 'agentos-enrich-'));
    try {
      const toolsPath = join(root, 'tools.json');
      writeFileSync(
        toolsPath,
        JSON.stringify([{ name: 'search_contacts', method: 'GET' }]),
        'utf8',
      );
      const ext = enrichExtension({
        id: 'crm',
        kind: 'customer',
        rootDir: root,
        name: 'CRM',
        meta: {},
        ui: {},
        agent: { tools: toolsPath },
      });
      expect(ext.agentDescriptors.tools).toEqual([
        { name: 'search_contacts', method: 'GET' },
      ]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('enrichRegistry is idempotent', () => {
    const model: RegistryModel = {
      scannedAt: 1,
      extensions: [
        enrichExtension({
          id: 'auth',
          kind: 'builtin',
          rootDir: '/a',
          name: 'Auth',
          meta: {},
          ui: { page: '/a/page.tsx' },
          agent: {},
        }),
      ],
    };
    const again = enrichRegistry(model);
    expect(again.extensions[0]?.driven).toBe(true);
    expect(again.extensions[0]?.uiEntries.page).toBe(
      '/__agentos/ext/auth/page.html',
    );
  });
});
