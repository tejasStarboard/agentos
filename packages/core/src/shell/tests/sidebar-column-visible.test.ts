import { describe, expect, test } from 'bun:test';
import {
  sidebarColumnVisible,
  type UiContribution,
} from '@agentos/core/shell/lib';

const crmSidebar: UiContribution = {
  extensionId: 'crm',
  view: 'sidebar',
  src: '/__agentos/ext/crm/sidebar.html',
};

describe('sidebarColumnVisible', () => {
  test('hides when sidebarOpen is false', () => {
    expect(
      sidebarColumnVisible({
        sidebarOpen: false,
        sidebarPanel: 'extensions',
        activeView: 'home',
        sidebars: [crmSidebar],
        hasDashboardSidebar: true,
      }),
    ).toBe(false);
  });

  test('shows shell panels when open', () => {
    expect(
      sidebarColumnVisible({
        sidebarOpen: true,
        sidebarPanel: 'extensions',
        activeView: 'home',
        sidebars: [],
        hasDashboardSidebar: false,
      }),
    ).toBe(true);
    expect(
      sidebarColumnVisible({
        sidebarOpen: true,
        sidebarPanel: 'hitl',
        activeView: 'demo',
        sidebars: [],
        hasDashboardSidebar: false,
      }),
    ).toBe(true);
  });

  test('home without dashboardSidebar hides in contribution mode', () => {
    expect(
      sidebarColumnVisible({
        sidebarOpen: true,
        sidebarPanel: 'contribution',
        activeView: 'home',
        sidebars: [crmSidebar],
        hasDashboardSidebar: false,
      }),
    ).toBe(false);
  });

  test('home with dashboardSidebar shows in contribution mode', () => {
    expect(
      sidebarColumnVisible({
        sidebarOpen: true,
        sidebarPanel: 'contribution',
        activeView: 'home',
        sidebars: [],
        hasDashboardSidebar: true,
      }),
    ).toBe(true);
  });

  test('extension without sidebar hides; CRM with sidebar shows', () => {
    expect(
      sidebarColumnVisible({
        sidebarOpen: true,
        sidebarPanel: 'contribution',
        activeView: 'demo',
        sidebars: [crmSidebar],
        hasDashboardSidebar: false,
      }),
    ).toBe(false);
    expect(
      sidebarColumnVisible({
        sidebarOpen: true,
        sidebarPanel: 'contribution',
        activeView: 'crm',
        sidebars: [crmSidebar],
        hasDashboardSidebar: false,
      }),
    ).toBe(true);
  });
});
