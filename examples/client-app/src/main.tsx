import { mountShell } from '@agentos/core';

const root = document.getElementById('root');
if (!root) {
  throw new Error('Missing #root element');
}

mountShell(root);
