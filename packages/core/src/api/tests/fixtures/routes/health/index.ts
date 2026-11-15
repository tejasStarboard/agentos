import type { RouteHandlers } from '@agentos/core/api';

/** Overrides built-in health with extra fields. */
export const GET: RouteHandlers['GET'] = async (c) => {
  return c.json({ ok: true, source: 'file-route' });
};
