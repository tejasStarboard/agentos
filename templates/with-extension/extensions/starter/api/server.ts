import { createApp, loadRoutes } from '@agentos/core/api';

const PORT = 6110;

const app = createApp();
await loadRoutes(app, `${import.meta.dir}/routes`);

const server = Bun.serve({
  port: PORT,
  fetch: app.fetch,
});

console.log(
  `[agentos starter] listening on http://127.0.0.1:${server.port} (proxy /api/ext/starter/*)`,
);
