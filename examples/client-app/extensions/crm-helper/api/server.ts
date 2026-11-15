import { createApp, loadRoutes } from '@agentos/core/api';

const PORT = 6101;

const app = createApp();
await loadRoutes(app, `${import.meta.dir}/routes`);

const server = Bun.serve({
  port: PORT,
  fetch: app.fetch,
});

console.log(
  `[agentos crm-helper] listening on http://127.0.0.1:${server.port} (proxy /api/ext/crm-helper/*)`,
);
