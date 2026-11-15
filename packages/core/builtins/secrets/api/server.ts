import { keys } from './env';
import { SECRETS_PORT } from './lib/constants';
import { handleSecretsRequest } from './lib/handle-request';

const env = keys();

const port = env.AGENT_OS_EXT_SECRETS_PORT ?? SECRETS_PORT;

const server = Bun.serve({
  port,
  async fetch(request) {
    return handleSecretsRequest({ runtimeEnv: Bun.env }, request);
  },
});

console.log(
  `[agentos secrets] listening on http://127.0.0.1:${server.port} (proxy /api/ext/secrets/*)`,
);
