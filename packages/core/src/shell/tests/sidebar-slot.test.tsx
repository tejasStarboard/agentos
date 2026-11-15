import { beforeEach, describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { SidebarSlot } from '@agentos/core/shell/components';
import { useShellStore, type UiContribution } from '@agentos/core/shell/lib';

const sidebars: UiContribution[] = [
  {
    extensionId: 'crm',
    view: 'sidebar',
    src: '/__agentos/ext/crm/sidebar.html',
  },
  {
    extensionId: 'demo',
    view: 'sidebar',
    src: '/__agentos/ext/demo/sidebar.html',
  },
];

describe('SidebarSlot contextual + shell panels', () => {
  beforeEach(() => {
    useShellStore.setState({
      activeView: 'home',
      sidebarOpen: true,
      drawerOpen: false,
      hitlInboxOpen: false,
      contributions: sidebars,
    });
  });

  test('shows only the active extension sidebar in contribution mode', () => {
    const onCrm = renderToStaticMarkup(
      <SidebarSlot
        sidebarOpen
        activeView="crm"
        contributions={sidebars}
        drawerOpen={false}
        hitlInboxOpen={false}
      />,
    );
    expect(onCrm).toContain('data-sidebar-panel="contribution"');
    expect(onCrm).toContain('data-extension-id="crm"');
    expect(onCrm).toContain('data-extension-id="demo"');
    expect(onCrm).toMatch(
      /data-sidebar-active="true"[\s\S]*data-extension-id="crm"/,
    );
    expect(onCrm).toMatch(
      /data-sidebar-active="false"[\s\S]*data-extension-id="demo"/,
    );

    const onDemo = renderToStaticMarkup(
      <SidebarSlot
        sidebarOpen
        activeView="demo"
        contributions={sidebars}
        drawerOpen={false}
        hitlInboxOpen={false}
      />,
    );
    expect(onDemo).toMatch(
      /data-sidebar-active="true"[\s\S]*data-extension-id="demo"/,
    );
    expect(onDemo).toMatch(
      /data-sidebar-active="false"[\s\S]*data-extension-id="crm"/,
    );
  });

  test('home with sidebars present shows empty contribution placeholder', () => {
    const html = renderToStaticMarkup(
      <SidebarSlot
        sidebarOpen
        activeView="home"
        contributions={sidebars}
        drawerOpen={false}
        hitlInboxOpen={false}
      />,
    );
    expect(html).toContain('data-sidebar-panel="contribution"');
    expect(html).toContain('Sidebar slot');
    expect(html).not.toContain('data-sidebar-active="true"');
  });

  test('drawerOpen renders Extension Manager inside sidebar (no sheet)', () => {
    const html = renderToStaticMarkup(
      <SidebarSlot
        sidebarOpen
        activeView="home"
        contributions={sidebars}
        drawerOpen
        hitlInboxOpen={false}
      />,
    );
    expect(html).toContain('data-sidebar-panel="extensions"');
    expect(html).toContain('data-slot="extension-manager"');
    expect(html).toContain('Extensions');
    expect(html).not.toContain('data-view="sidebar"');
    expect(html).not.toContain('role="dialog"');
  });

  test('hitlInboxOpen renders Approvals inside sidebar (no sheet)', () => {
    const html = renderToStaticMarkup(
      <SidebarSlot
        sidebarOpen
        activeView="home"
        contributions={sidebars}
        drawerOpen={false}
        hitlInboxOpen
      />,
    );
    expect(html).toContain('data-sidebar-panel="hitl"');
    expect(html).toContain('data-slot="hitl-inbox"');
    expect(html).toContain('Approvals');
    expect(html).not.toContain('data-view="sidebar"');
    expect(html).not.toContain('role="dialog"');
  });
});
