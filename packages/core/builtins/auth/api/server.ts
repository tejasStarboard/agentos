import { keys } from './env';
import { AUTH_PORT } from './lib/constants';
import { createAuth } from './lib/create-auth';
import { handleAuthRequest } from './lib/handle-request';

const env = keys();

const port = env.AGENT_OS_EXT_AUTH_PORT ?? AUTH_PORT;

const ctx = await createAuth({
  secret: env.AGENT_OS_EXT_AUTH_SECRET,
  databasePath: env.AGENT_OS_EXT_AUTH_DB,
  baseURL: env.AGENT_OS_EXT_AUTH_BASE_URL,
});

const server = Bun.serve({
  port,
  async fetch(request) {
    return handleAuthRequest(ctx, request);
  },
});

console.log(
  `[agentos auth] listening on http://127.0.0.1:${server.port} (proxy /api/ext/auth/*)`,
);
