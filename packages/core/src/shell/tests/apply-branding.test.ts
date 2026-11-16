import { afterEach, describe, expect, test } from 'bun:test';

import { applyBranding, isFontUrl } from '@agentos/core/shell/lib';

describe('isFontUrl', () => {
  test('detects /_public and http(s) URLs', () => {
    expect(isFontUrl('/_public/fonts/sans.woff2')).toBe(true);
    expect(isFontUrl('https://cdn.example/font.woff2')).toBe(true);
    expect(isFontUrl("'IBM Plex Sans', sans-serif")).toBe(false);
  });
});

describe('applyBranding', () => {
  const nodes = new Map<
    string,
    {
      id?: string;
      textContent?: string;
      href?: string;
      rel?: string;
      attrs: Record<string, string>;
    }
  >();
  let title = '';
  const originalDocument = (globalThis as { document?: unknown }).document;

  afterEach(() => {
    nodes.clear();
    title = '';
    if (originalDocument === undefined) {
      delete (globalThis as { document?: unknown }).document;
    } else {
      (globalThis as { document: unknown }).document = originalDocument;
    }
  });

  test('sets title, favicon, and CSS font vars from branding', () => {
    (globalThis as { document: unknown }).document = {
      get title() {
        return title;
      },
      set title(value: string) {
        title = value;
      },
      head: {
        appendChild(el: { id?: string; attrs: Record<string, string> }) {
          if (el.id) nodes.set(el.id, el);
          if (el.attrs['data-agentos-branding-favicon'] != null) {
            nodes.set('favicon', el);
          }
        },
      },
      getElementById(id: string) {
        return nodes.get(id) ?? null;
      },
      querySelector(selector: string) {
        if (selector.includes('data-agentos-branding-favicon')) {
          return nodes.get('favicon') ?? null;
        }
        return null;
      },
      createElement(tag: string) {
        const el = {
          id: '',
          textContent: '',
          href: '',
          rel: '',
          attrs: {} as Record<string, string>,
          setAttribute(name: string, value: string) {
            this.attrs[name] = value;
          },
          remove() {
            if (this.id) nodes.delete(this.id);
          },
          tag,
        };
        return el;
      },
    };

    applyBranding({
      appName: 'Acme',
      faviconUrl: '/_public/favicon.svg',
      fontSans: '/_public/fonts/sans.woff2',
      fontHeading: "'Georgia', serif",
    });

    expect(title).toBe('Acme');
    expect(nodes.get('favicon')?.href).toBe('/_public/favicon.svg');

    const style = nodes.get('agentos-branding-fonts');
    expect(style?.textContent).toContain('@font-face');
    expect(style?.textContent).toContain('/_public/fonts/sans.woff2');
    expect(style?.textContent).toContain("--font-heading:'Georgia', serif");
  });
});
