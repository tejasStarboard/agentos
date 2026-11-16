import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { ActivityBar } from '../components/activity-bar';
import { buildActivityBarSections } from '../lib/build-activity-bar-items';
import type { ExtensionEntry } from '../lib/extension-catalog';
import type { UiContribution } from '../lib/contribution';

const catalog: ExtensionEntry[] = [
  {
    id: 'auth',
    name: 'Auth',
    kind: 'builtin',
    toggleable: false,
    driven: true,
    activityBarSection: 'secondary',
  },
  {
    id: 'hitl',
    name: 'HITL',
    kind: 'builtin',
    toggleable: false,
    driven: true,
    activityBarSection: 'secondary',
  },
  {
    id: 'demo',
    name: 'Demo',
    kind: 'customer',
    toggleable: true,
    driven: false,
  },
];

const contributions: UiContribution[] = [
  {
    extensionId: 'auth',
    view: 'page',
    src: '/__agentos/ext/auth/page.html',
  },
  {
    extensionId: 'demo',
    view: 'page',
    src: '/__agentos/ext/demo/page.html',
  },
];

describe('buildActivityBarSections', () => {
  test('puts customer pages in primary and auth/Approvals in secondary', () => {
    const { primary, secondary } = buildActivityBarSections({
      extensions: catalog,
      enabledById: { auth: true, hitl: true, demo: true },
      contributions,
    });

    expect(primary.map((i) => i.id)).toEqual(['home', 'demo']);
    expect(secondary.map((i) => i.id)).toEqual(['hitl', 'auth', 'extensions']);
    expect(secondary.find((i) => i.id === 'hitl')?.panel).toBe('hitl');
    expect(secondary.find((i) => i.id === 'hitl')?.label).toBe('Approvals');
    expect(secondary.find((i) => i.id === 'extensions')?.panel).toBe(
      'extensions',
    );
  });

  test('omits disabled customer pages from primary', () => {
    const { primary } = buildActivityBarSections({
      extensions: catalog,
      enabledById: { auth: true, hitl: true, demo: false },
      contributions,
    });
    expect(primary.map((i) => i.id)).toEqual(['home']);
  });

  test('defaults builtin auth/hitl to secondary when section field is missing', () => {
    const withoutSection: ExtensionEntry[] = [
      {
        id: 'auth',
        name: 'Auth',
        kind: 'builtin',
        toggleable: false,
        driven: true,
      },
      {
        id: 'hitl',
        name: 'HITL',
        kind: 'builtin',
        toggleable: false,
        driven: true,
      },
      {
        id: 'demo',
        name: 'Demo',
        kind: 'customer',
        toggleable: true,
        driven: false,
      },
    ];
    const { primary, secondary } = buildActivityBarSections({
      extensions: withoutSection,
      enabledById: { auth: true, hitl: true, demo: true },
      contributions,
    });
    expect(primary.map((i) => i.id)).toEqual(['home', 'demo']);
    expect(secondary.map((i) => i.id)).toEqual(['hitl', 'auth', 'extensions']);
  });
});

describe('ActivityBar layout regions', () => {
  test('renders distinct primary and secondary regions', () => {
    const html = renderToStaticMarkup(<ActivityBar />);
    expect(html).toContain('data-slot="activity-bar-primary"');
    expect(html).toContain('data-slot="activity-bar-secondary"');
    expect(html).toContain('aria-label="Home"');
    expect(html).toContain('aria-label="Extensions"');
  });
});
