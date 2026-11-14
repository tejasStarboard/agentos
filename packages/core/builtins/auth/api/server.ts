import { AUTH_PORT } from './lib/constants';
import { createAuth } from './lib/create-auth';
import { handleAuthRequest } from './lib/handle-request';

const port = Number(Bun.env.AGENTOS_AUTH_PORT ?? AUTH_PORT);

const ctx = await createAuth();

const server = Bun.serve({
  port,
  async fetch(request) {
    return handleAuthRequest(ctx, request);
  },
});

console.log(
  `[agentos auth] listening on http://127.0.0.1:${server.port} (proxy /api/ext/auth/*)`,
);
