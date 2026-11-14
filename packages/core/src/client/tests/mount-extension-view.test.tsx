import { describe, expect, test } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  ExtensionViewApp,
  createStandaloneHost,
  isShellIframe,
  resolveThemeFromSearch,
} from '@agentos/core/client';
import { createStubHost } from './stub-host';

describe('resolveThemeFromSearch', () => {
  test('defaults to dark when missing or invalid', () => {
    expect(resolveThemeFromSearch('')).toBe('dark');
    expect(resolveThemeFromSearch('?')).toBe('dark');
    expect(resolveThemeFromSearch('?theme=neon')).toBe('dark');
  });

  test('accepts light and dark from query', () => {
    expect(resolveThemeFromSearch('?theme=light')).toBe('light');
    expect(resolveThemeFromSearch('?theme=dark')).toBe('dark');
    expect(resolveThemeFromSearch('foo=1&theme=light')).toBe('light');
  });
});

describe('standalone host', () => {
  test('isShellIframe is false outside a nested frame', () => {
    expect(isShellIframe()).toBe(false);
  });

  test('createStandaloneHost exposes host namespaces', async () => {
    const host = createStandaloneHost();
    expect(await host.storage.get('x')).toBeNull();
    await host.storage.set('x', 1);
    expect(await host.storage.get('x')).toBe(1);
  });
});

describe('ExtensionViewApp', () => {
  test('renders view under HostProvider when host is injected', () => {
    const host = createStubHost();

    function View() {
      return createElement('div', { 'data-view': 'crm-page' }, 'CRM');
    }

    const html = renderToStaticMarkup(
      createElement(ExtensionViewApp, {
        View,
        theme: 'light',
        host,
      }),
    );

    expect(html).toContain('data-view="crm-page"');
    expect(html).toContain('CRM');
  });
});
