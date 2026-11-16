import { describe, expect, test } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { HostProvider } from '@agentos/core/client';
import type { HostAPIClient } from '@agentos/core/sdk';

import AuthAccountSidebar from '../ui/sidebar';
import {
  ACCOUNT_SECTION_LABELS,
  ACCOUNT_SECTIONS,
  parseAccountSection,
} from '../ui/account-section';

function createTestHost(): HostAPIClient {
  const store = new Map<string, unknown>();
  return {
    storage: {
      get: async (key) => (store.has(key) ? (store.get(key) as never) : null),
      set: async (key, value) => {
        store.set(key, value);
      },
      remove: async (key) => {
        store.delete(key);
      },
    },
    notifications: { show: async () => {} },
    ai: { generateText: async () => ({ text: '' }) },
    hitl: {
      requestApproval: async () => ({ approved: true, id: '1' }),
    },
    api: {
      fetch: async () => ({ ok: true, status: 200, body: '{}' }),
    },
    events: { publish: async () => {} },
  };
}

describe('account section helpers', () => {
  test('parseAccountSection falls back to profile', () => {
    expect(parseAccountSection('security')).toBe('security');
    expect(parseAccountSection('nope')).toBe('profile');
    expect(parseAccountSection(null)).toBe('profile');
  });
});

describe('AuthAccountSidebar', () => {
  test('renders nav options for all account sections', () => {
    const html = renderToStaticMarkup(
      createElement(HostProvider, {
        host: createTestHost(),
        children: createElement(AuthAccountSidebar),
      }),
    );
    expect(html).toContain('data-slot="auth-account-sidebar"');
    for (const id of ACCOUNT_SECTIONS) {
      expect(html).toContain(`data-account-section="${id}"`);
      expect(html).toContain(ACCOUNT_SECTION_LABELS[id]);
    }
    expect(html).toContain('data-active="true"');
  });
});
