/**
 * BFF-only escape hatch: builtins + customer Bun/Python APIs without Vite.
 * Prefer `agentos dev` from the consumer app for the full stack.
 */
import { join } from 'node:path';

import { runDev } from '../src/cli/lib/dev';
import { repoRoot } from '../src/cli/lib/paths';

const consumerRoot =
  Bun.env.AGENT_OS_CONSUMER_ROOT?.trim() ||
  join(repoRoot(), 'examples/client-app');

await runDev({
  cwd: consumerRoot,
  startVite: false,
});
