import type { RouteHandlers } from '@agentos/core/api';

export const GET: RouteHandlers['GET'] = async (c) => {
  return c.json({ id: c.req.param('id') });
};

export const DELETE: RouteHandlers['DELETE'] = async (c) => {
  return c.json({ deleted: c.req.param('id') });
};
