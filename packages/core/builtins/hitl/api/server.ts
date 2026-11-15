import { keys } from './env';
import { createApprovalsStore } from './lib/approvals-store';
import { HITL_PORT } from './lib/constants';
import { handleHitlRequest } from './lib/handle-request';

const env = keys();

const port = env.AGENT_OS_EXT_HITL_PORT ?? HITL_PORT;

const store = createApprovalsStore();

const server = Bun.serve({
  port,
  async fetch(request) {
    return handleHitlRequest(store, request);
  },
});

console.log(
  `[agentos hitl] listening on http://127.0.0.1:${server.port} (proxy /api/ext/hitl/*)`,
);
