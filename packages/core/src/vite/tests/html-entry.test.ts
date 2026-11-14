import { describe, expect, test } from 'bun:test';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { serializeExtEntryModule } from '../lib/ext-entry-module';
import {
  parseExtHtmlPath,
  parseVirtualExtEntryId,
  renderExtHtmlEntry,
  resolvedVirtualExtEntryId,
  virtualExtEntryId,
  virtualExtEntryScriptSrc,
} from '../lib/html-entry';

const fixturesRoot = fileURLToPath(new URL('./fixtures', import.meta.url));

describe('html-entry helpers', () => {
  test('parseExtHtmlPath accepts convention paths', () => {
    expect(parseExtHtmlPath('/__agentos/ext/crm/page.html')).toEqual({
      extensionId: 'crm',
      view: 'page',
    });
    expect(
      parseExtHtmlPath('/__agentos/ext/auth/sidebar.html?theme=dark'),
    ).toEqual({
      extensionId: 'auth',
      view: 'sidebar',
    });
    expect(parseExtHtmlPath('/__agentos/ext/bare/widget.html')).toEqual({
      extensionId: 'bare',
      view: 'widget',
    });
  });

  test('parseExtHtmlPath rejects non-entries', () => {
    expect(parseExtHtmlPath('/api/ext/crm/page')).toBeNull();
    expect(parseExtHtmlPath('/__agentos/ext/crm/page')).toBeNull();
    expect(parseExtHtmlPath('/__agentos/ext/crm/other.html')).toBeNull();
  });

  test('virtual entry ids round-trip', () => {
    expect(virtualExtEntryId('crm', 'page')).toBe(
      'virtual:agentos-ext-entry/crm/page',
    );
    expect(resolvedVirtualExtEntryId('auth', 'page')).toBe(
      '\0virtual:agentos-ext-entry/auth/page',
    );
    expect(
      parseVirtualExtEntryId('virtual:agentos-ext-entry/crm/sidebar'),
    ).toEqual({ extensionId: 'crm', view: 'sidebar' });
    expect(
      parseVirtualExtEntryId('\0virtual:agentos-ext-entry/auth/page'),
    ).toEqual({ extensionId: 'auth', view: 'page' });
  });

  test('renderExtHtmlEntry boots virtual script and FOUC theme', () => {
    const html = renderExtHtmlEntry({
      extensionId: 'crm',
      view: 'page',
      scriptSrc: virtualExtEntryScriptSrc('crm', 'page'),
    });
    expect(html).toContain('<div id="root"></div>');
    expect(html).toContain('src="/@id/virtual:agentos-ext-entry/crm/page"');
    expect(html).toContain('agentos-theme');
    expect(html).toContain('theme');
  });

  test('serializeExtEntryModule imports fixture view path', () => {
    const pagePath = join(fixturesRoot, 'extensions/crm/ui/page.tsx');
    const source = serializeExtEntryModule(pagePath);
    expect(source).toContain(
      "import { mountExtensionView } from '@agentos/core/client'",
    );
    expect(source).toContain(`import View from ${JSON.stringify(pagePath)}`);
    expect(source).toContain('mountExtensionView(View)');
  });
});
