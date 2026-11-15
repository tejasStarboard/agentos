import { describe, expect, test } from 'bun:test';

import { createApp } from '@agentos/core/api';
import type { Middleware } from '@agentos/core/api';

describe('createApp', () => {
  test('GET /health returns { ok: true } by default', async () => {
    const app = createApp();
    const res = await app.fetch(new Request('http://localhost/health'));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  test('unknown path returns 404', async () => {
    const app = createApp();
    const res = await app.fetch(new Request('http://localhost/missing'));
    expect(res.status).toBe(404);
  });

  test('wrong method on registered path returns 405', async () => {
    const app = createApp();
    app.route('GET', '/items', (c) => c.json({ items: [] }));
    const res = await app.fetch(
      new Request('http://localhost/items', { method: 'POST' }),
    );
    expect(res.status).toBe(405);
  });

  test('static route handler runs', async () => {
    const app = createApp();
    app.route('POST', '/echo', async (c) => {
      const body = await c.req.json();
      return c.json({ echo: body });
    });
    const res = await app.fetch(
      new Request('http://localhost/echo', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ hello: 'world' }),
      }),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ echo: { hello: 'world' } });
  });

  test('param route exposes c.req.param', async () => {
    const app = createApp();
    app.route('GET', '/contacts/:id', (c) =>
      c.json({ id: c.req.param('id'), also: c.params.id }),
    );
    const res = await app.fetch(new Request('http://localhost/contacts/42'));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ id: '42', also: '42' });
  });

  test('middleware runs in order and can short-circuit', async () => {
    const order: string[] = [];
    const a: Middleware = async (_c, next) => {
      order.push('a');
      await next();
      order.push('a-after');
    };
    const b: Middleware = async (c) => {
      order.push('b');
      return c.json({ blocked: true }, { status: 403 });
    };
    const app = createApp();
    app.route(
      'GET',
      '/guarded',
      (c) => {
        order.push('handler');
        return c.json({ ok: true });
      },
      [a, b],
    );
    const res = await app.fetch(new Request('http://localhost/guarded'));
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ blocked: true });
    expect(order).toEqual(['a', 'b', 'a-after']);
  });

  test('later route registration overrides earlier (health override)', async () => {
    const app = createApp();
    app.route('GET', '/health', (c) => c.json({ ok: true, custom: true }));
    const res = await app.fetch(new Request('http://localhost/health'));
    expect(await res.json()).toEqual({ ok: true, custom: true });
  });
});
