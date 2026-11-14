import { beforeEach, describe, expect, mock, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  ActivityBar,
  ExtensionManagerList,
} from '@agentos/core/shell/components';
import {
  defaultEnabledById,
  defaultSkillsByExtension,
  STUB_EXTENSION_CATALOG,
  useShellStore,
} from '@agentos/core/shell/lib';

function resetStore() {
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
  });
}

describe('ExtensionManagerDrawer', () => {
  beforeEach(() => {
    resetStore();
    mock.restore();
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(null, { status: 404 })),
    ) as unknown as typeof fetch;
  });

  test('list shows builtins and customers with status badges', () => {
    const html = renderToStaticMarkup(
      <ExtensionManagerList
        extensions={STUB_EXTENSION_CATALOG}
        enabledById={defaultEnabledById()}
      />,
    );

    expect(html).toContain('data-slot="extension-manager-list"');
    expect(html).toContain('data-extension-id="auth"');
    expect(html).toContain('data-kind="builtin"');
    expect(html).toContain('data-extension-id="crm"');
    expect(html).toContain('data-kind="customer"');
    expect(html).toContain('data-status="active"');
    expect(html).toContain('Locked');
    expect(html).toContain('Auth is always on');
    expect(html).toContain('Disable CRM');
  });

  test('disabled customer shows disabled status', () => {
    const html = renderToStaticMarkup(
      <ExtensionManagerList
        extensions={STUB_EXTENSION_CATALOG}
        enabledById={{ ...defaultEnabledById(), crm: false }}
      />,
    );
    expect(html).toContain('data-extension-id="crm"');
    expect(html).toContain('data-status="disabled"');
    expect(html).toContain('Enable CRM');
  });

  test('ActivityBar Extensions control toggles drawer without changing view', () => {
    const html = renderToStaticMarkup(<ActivityBar />);
    expect(html).toContain('aria-label="Extensions"');

    useShellStore.getState().setDrawerOpen(true);
    expect(useShellStore.getState().drawerOpen).toBe(true);
    expect(useShellStore.getState().activeView).toBe('home');
  });
});
