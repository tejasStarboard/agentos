import { afterEach, describe, expect, test } from 'bun:test';

import { createApp } from '@agentos/core/api';
import {
  clearHooks,
  onError,
  onRequest,
  onResponse,
  onStart,
  runStartHooks,
} from '@agentos/core/api/hooks';

afterEach(() => {
  clearHooks();
});

describe('hooks registry', () => {
  test('runStartHooks runs onStart in order', async () => {
    const order: string[] = [];
    onStart(() => {
      order.push('a');
    });
    onStart(async () => {
      order.push('b');
    });
    await runStartHooks();
    expect(order).toEqual(['a', 'b']);
  });

  test('onRequest / onResponse run around createApp.fetch', async () => {
    const order: string[] = [];
    onRequest(() => {
      order.push('request');
    });
    onResponse((_req, res) => {
      order.push('response');
      return res;
    });

    const app = createApp();
    const res = await app.fetch(new Request('http://localhost/health'));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(order).toEqual(['request', 'response']);
  });

  test('onRequest can short-circuit with a Response', async () => {
    onRequest(() => new Response('blocked', { status: 403 }));
    const app = createApp();
    const res = await app.fetch(new Request('http://localhost/health'));
    expect(res.status).toBe(403);
    expect(await res.text()).toBe('blocked');
  });

  test('onError handles thrown handler errors', async () => {
    onError((error) => {
      const message = error instanceof Error ? error.message : String(error);
      return Response.json({ hooked: message }, { status: 502 });
    });

    const app = createApp();
    app.route('GET', '/boom', () => {
      throw new Error('kaboom');
    });
    const res = await app.fetch(new Request('http://localhost/boom'));
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ hooked: 'kaboom' });
  });

  test('clearHooks removes registrations', async () => {
    onStart(() => {
      throw new Error('should not run');
    });
    clearHooks();
    await runStartHooks();
  });
});
