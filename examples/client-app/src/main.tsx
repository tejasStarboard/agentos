import { mountShell } from '@agentos/core';
import Dashboard from '../ui/dashboard';
import DashboardSidebar from '../ui/dashboard-sidebar';

const root = document.getElementById('root');
if (!root) {
  throw new Error('Missing #root element');
}

mountShell(root, {
  dashboard: Dashboard,
  dashboardSidebar: DashboardSidebar,
});
