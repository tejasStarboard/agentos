import { keys } from './env';
import { AI_PORT, DEFAULT_GATEWAY_URL } from './lib/constants';
import { createAiModels } from './lib/create-model';
import { handleAiRequest } from './lib/handle-request';

const env = keys();

const port = env.AGENT_OS_EXT_AI_PORT ?? AI_PORT;
const gatewayUrl = env.AGENT_OS_EXT_AI_GATEWAY_URL ?? DEFAULT_GATEWAY_URL;
const models = createAiModels(env.AGENT_OS_EXT_AI_MODEL);

const server = Bun.serve({
  port,
  async fetch(request) {
    return handleAiRequest({ models, gatewayUrl }, request);
  },
});

console.log(
  `[agentos ai] listening on http://127.0.0.1:${server.port} (proxy /api/ext/ai/*) mode=${models.mode}`,
);
