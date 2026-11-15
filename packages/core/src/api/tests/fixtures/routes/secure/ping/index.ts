import type { Middleware, RouteHandlers } from '@agentos/core/api';

const requireToken: Middleware = async (c, next) => {
  if (c.req.headers.get('x-token') !== 'secret') {
    return c.json({ error: 'unauthorized' }, { status: 401 });
  }
  await next();
};

export const middleware = [requireToken];

export const GET: RouteHandlers['GET'] = async (c) => {
  return c.json({ pong: true });
};
