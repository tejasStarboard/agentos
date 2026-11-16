import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { ShellRoot } from '@agentos/core/shell/components';
import type { UiContribution } from '@agentos/core/shell/lib';

const crmSidebar: UiContribution = {
  extensionId: 'crm',
  view: 'sidebar',
  src: '/__agentos/ext/crm/sidebar.html',
};

function HomeSidebar() {
  return <div data-app-dashboard-sidebar />;
}

describe('mountShell / ShellRoot', () => {
  test('renders workspace with required slots', () => {
    const html = renderToStaticMarkup(<ShellRoot />);

    expect(html).toContain('data-agentos-shell');
    expect(html).toContain('data-slot="main"');
    expect(html).toContain('data-slot="dashboard"');
    expect(html).toContain('data-slot="hidden"');
    expect(html).toContain('data-slot="status-bar"');
    expect(html).toContain('Command Palette');
  });

  test('home without dashboardSidebar hides empty sidebar column', () => {
    const html = renderToStaticMarkup(
      <ShellRoot
        activeView="home"
        sidebarOpen
        sidebarPanel="contribution"
        contributions={[crmSidebar]}
      />,
    );
    expect(html).not.toContain('data-slot="sidebar"');
    expect(html).toContain('data-slot="dashboard"');
  });

  test('home with dashboardSidebar shows sidebar column', () => {
    const html = renderToStaticMarkup(
      <ShellRoot
        activeView="home"
        sidebarOpen
        sidebarPanel="contribution"
        dashboardSidebar={HomeSidebar}
      />,
    );
    expect(html).toContain('data-slot="sidebar"');
    expect(html).toContain('data-slot="dashboard-sidebar"');
    expect(html).toContain('data-app-dashboard-sidebar');
  });

  test('extension without sidebar hides column; CRM with sidebar shows it', () => {
    const demoHtml = renderToStaticMarkup(
      <ShellRoot
        activeView="demo"
        sidebarOpen
        sidebarPanel="contribution"
        contributions={[crmSidebar]}
      />,
    );
    expect(demoHtml).not.toContain('data-slot="sidebar"');

    const crmHtml = renderToStaticMarkup(
      <ShellRoot
        activeView="crm"
        sidebarOpen
        sidebarPanel="contribution"
        contributions={[crmSidebar]}
      />,
    );
    expect(crmHtml).toContain('data-slot="sidebar"');
    expect(crmHtml).toContain('data-extension-id="crm"');
  });

  test('extensions panel still allocates sidebar column', () => {
    const html = renderToStaticMarkup(
      <ShellRoot
        activeView="home"
        sidebarOpen
        sidebarPanel="extensions"
        contributions={[]}
      />,
    );
    expect(html).toContain('data-slot="sidebar"');
    expect(html).toContain('data-sidebar-panel="extensions"');
  });

  test('non-home view keeps main slot active', () => {
    const html = renderToStaticMarkup(<ShellRoot activeView="crm" />);
    expect(html).toContain('data-slot="main"');
    expect(html).toMatch(/data-active="true"[^>]*>[\s\S]*data-slot="main"/);
  });
});
