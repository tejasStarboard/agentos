import type { RouteHandlers } from '@agentos/core/api';

/** GET /api/ext/starter/hello → { ok, message } */
export const GET: RouteHandlers['GET'] = async (c) => {
  return c.json({ ok: true, message: 'Hello from starter' });
};
