import { describe, expect, test } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  ExtensionFrame,
  HomeDashboard,
  MainCanvas,
  ShellRoot,
  SidebarSlot,
} from '@agentos/core/shell/components';
import { contributionKey, useShellStore } from '@agentos/core/shell/lib';

const crmContributions = [
  {
    extensionId: 'crm',
    view: 'page' as const,
    src: '/__agentos/ext/crm/page.html',
  },
  {
    extensionId: 'crm',
    view: 'sidebar' as const,
    src: '/__agentos/ext/crm/sidebar.html',
  },
  {
    extensionId: 'crm',
    view: 'widget' as const,
    src: '/__agentos/ext/crm/widget.html',
  },
];

describe('ExtensionFrame slot placement', () => {
  test('sandboxed iframe markup includes required attrs', () => {
    const html = renderToStaticMarkup(
      createElement(ExtensionFrame, {
        contribution: crmContributions[0]!,
        visible: true,
        theme: 'dark',
      }),
    );
    expect(html).toContain('sandbox="allow-scripts allow-same-origin"');
    expect(html).toContain('data-extension-id="crm"');
    expect(html).toContain('data-view="page"');
    expect(html).toContain('src="/__agentos/ext/crm/page.html?theme=dark"');
  });

  test('passes light theme into iframe query', () => {
    const html = renderToStaticMarkup(
      createElement(ExtensionFrame, {
        contribution: crmContributions[0]!,
        visible: true,
        theme: 'light',
      }),
    );
    expect(html).toContain('src="/__agentos/ext/crm/page.html?theme=light"');
  });

  test('sandboxed iframes mount into main / sidebar / widgets slots', () => {
    const main = renderToStaticMarkup(
      createElement(MainCanvas, {
        activeView: 'crm',
        contributions: crmContributions,
      }),
    );
    expect(main).toContain('data-slot="main"');
    expect(main).toContain('sandbox="allow-scripts allow-same-origin"');
    expect(main).toContain('data-view="page"');

    const sidebar = renderToStaticMarkup(
      createElement(SidebarSlot, {
        sidebarOpen: true,
        contributions: crmContributions,
      }),
    );
    expect(sidebar).toContain('data-view="sidebar"');
    expect(sidebar).toContain('sandbox="allow-scripts allow-same-origin"');

    const home = renderToStaticMarkup(
      createElement(HomeDashboard, { contributions: crmContributions }),
    );
    expect(home).toContain('data-slot="widgets"');
    expect(home).toContain('data-view="widget"');
  });

  test('inactive page stays mounted but hidden; crash status is per-contribution', () => {
    const contributions = [
      { extensionId: 'crm', view: 'page' as const, src: '/crm.html' },
      { extensionId: 'invoices', view: 'page' as const, src: '/invoices.html' },
    ];

    useShellStore.setState({
      contributions,
      runtimeStatus: {
        [contributionKey('crm', 'page')]: 'active',
        [contributionKey('invoices', 'page')]: 'crashed',
      },
    });

    const main = renderToStaticMarkup(
      createElement(MainCanvas, {
        activeView: 'crm',
        contributions,
      }),
    );
    expect(main).toContain('data-extension-id="crm"');
    expect(main).toContain('data-extension-id="invoices"');
    expect(main).toContain('src="/crm.html?theme=dark"');
    expect(main).toContain('src="/invoices.html?theme=dark"');
    expect(main).toContain('data-visible="false"');

    expect(useShellStore.getState().contributions).toHaveLength(2);
    expect(
      useShellStore.getState().runtimeStatus[
        contributionKey('invoices', 'page')
      ],
    ).toBe('crashed');
    expect(
      useShellStore.getState().runtimeStatus[contributionKey('crm', 'page')],
    ).toBe('active');
  });

  test('ShellRoot still exposes all slots', () => {
    const html = renderToStaticMarkup(createElement(ShellRoot));
    expect(html).toContain('data-slot="sidebar"');
    expect(html).toContain('data-slot="main"');
    expect(html).toContain('data-slot="widgets"');
    expect(html).toContain('data-slot="hidden"');
  });
});
