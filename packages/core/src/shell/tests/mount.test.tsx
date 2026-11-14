import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { ShellRoot } from '@agentos/core/shell/components';
import {
  defaultEnabledById,
  defaultSkillsByExtension,
  STUB_EXTENSION_CATALOG,
  useShellStore,
} from '@agentos/core/shell/lib';

function resetStore(
  overrides: Partial<ReturnType<typeof useShellStore.getState>> = {},
) {
  useShellStore.setState({
    activeView: 'home',
    sidebarOpen: true,
    drawerOpen: false,
    extensions: STUB_EXTENSION_CATALOG,
    enabledById: defaultEnabledById(),
    desiredContributions: [],
    contributions: [],
    runtimeStatus: {},
    desiredSkillsByExtension: defaultSkillsByExtension(),
    skillsByExtension: defaultSkillsByExtension(),
    statusText: null,
    statusTone: null,
    ...overrides,
  });
}

describe('mountShell / ShellRoot', () => {
  test('renders workspace with required slots', () => {
    resetStore();

    const html = renderToStaticMarkup(createElement(ShellRoot));

    expect(html).toContain('data-agentos-shell');
    expect(html).toContain('data-slot="sidebar"');
    expect(html).toContain('data-slot="main"');
    expect(html).toContain('data-slot="widgets"');
    expect(html).toContain('data-slot="hidden"');
    expect(html).toContain('data-slot="status-bar"');
    expect(html).toContain('Command Palette');
  });

  test('non-home view keeps main slot active', () => {
    resetStore({ activeView: 'crm' });

    const html = renderToStaticMarkup(createElement(ShellRoot));
    expect(html).toContain('data-slot="main"');
    expect(html).toMatch(/data-active="true"[^>]*>[\s\S]*data-slot="main"/);
  });
});
