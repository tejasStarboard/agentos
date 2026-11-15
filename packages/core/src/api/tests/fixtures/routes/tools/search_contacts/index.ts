import type { RouteHandlers } from '@agentos/core/api';

export const POST: RouteHandlers['POST'] = async (c) => {
  const input = (await c.req.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;
  return c.json({ ok: true, tool: 'search_contacts', input });
};
