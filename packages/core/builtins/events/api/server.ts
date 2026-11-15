import { keys } from './env';
import { EVENTS_PORT } from './lib/constants';
import { createEventBus } from './lib/event-bus';
import { handleEventsRequest } from './lib/handle-request';

const env = keys();

const port = env.AGENT_OS_EXT_EVENTS_PORT ?? EVENTS_PORT;

const bus = createEventBus();

const server = Bun.serve({
  port,
  async fetch(request) {
    return handleEventsRequest(bus, request);
  },
});

console.log(
  `[agentos events] listening on http://127.0.0.1:${server.port} (proxy /api/ext/events/*)`,
);
