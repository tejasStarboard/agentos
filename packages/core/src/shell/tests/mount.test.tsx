import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { ShellRoot } from '@agentos/core/shell/components';
import { useShellStore } from '@agentos/core/shell/lib';

describe('mountShell / ShellRoot', () => {
  test('renders workspace with required slots', () => {
    useShellStore.setState({
      activeView: 'home',
      sidebarOpen: true,
      drawerOpen: false,
      contributions: [],
      runtimeStatus: {},
    });

    const html = renderToStaticMarkup(createElement(ShellRoot));

    expect(html).toContain('data-agentos-shell');
    expect(html).toContain('data-slot="sidebar"');
    expect(html).toContain('data-slot="main"');
    expect(html).toContain('data-slot="widgets"');
    expect(html).toContain('data-slot="hidden"');
  });

  test('non-home view keeps main slot active', () => {
    useShellStore.setState({
      activeView: 'ext-placeholder',
      sidebarOpen: true,
      drawerOpen: false,
    });

    const html = renderToStaticMarkup(createElement(ShellRoot));
    expect(html).toContain('data-slot="main"');
    expect(html).toMatch(/data-active="true"[^>]*>[\s\S]*data-slot="main"/);
  });
});
