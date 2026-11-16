import { mountShell } from '@agentos/core';
import Dashboard from '../ui/dashboard';

const root = document.getElementById('root');
if (!root) {
  throw new Error('Missing #root element');
}

mountShell(root, { dashboard: Dashboard });
