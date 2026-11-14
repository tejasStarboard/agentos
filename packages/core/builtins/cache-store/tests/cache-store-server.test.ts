import { describe, expect, test } from 'bun:test';

import { createMemoryCache } from '@agentos/core/builtins/cache-store/api/lib/create-cache';
import { handleCacheStoreRequest } from '@agentos/core/builtins/cache-store/api/lib/handle-request';

describe('builtin cache-store server', () => {
  const cache = createMemoryCache();

  test('health OK', async () => {
    const health = await handleCacheStoreRequest(
      cache,
      new Request('http://127.0.0.1:6112/health'),
    );
    expect(health.status).toBe(200);
    expect(await health.json()).toEqual({ ok: true, backend: 'memory' });
  });

  test('set → get → ttl → del', async () => {
    const set = await handleCacheStoreRequest(
      cache,
      new Request('http://127.0.0.1:6112/set', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ key: 'greeting', value: { hello: 'world' } }),
      }),
    );
    expect(set.status).toBe(200);
    expect(await set.json()).toEqual({ ok: true });

    const get = await handleCacheStoreRequest(
      cache,
      new Request('http://127.0.0.1:6112/get', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ key: 'greeting' }),
      }),
    );
    expect(get.status).toBe(200);
    expect(await get.json()).toEqual({
      key: 'greeting',
      value: { hello: 'world' },
    });

    const ttl = await handleCacheStoreRequest(
      cache,
      new Request('http://127.0.0.1:6112/ttl', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ key: 'greeting' }),
      }),
    );
    expect(ttl.status).toBe(200);
    expect(await ttl.json()).toEqual({ key: 'greeting', ttl: null });

    const del = await handleCacheStoreRequest(
      cache,
      new Request('http://127.0.0.1:6112/del', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ key: 'greeting' }),
      }),
    );
    expect(del.status).toBe(200);
    expect(await del.json()).toEqual({ deleted: 1 });

    const missing = await handleCacheStoreRequest(
      cache,
      new Request('http://127.0.0.1:6112/get', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ key: 'greeting' }),
      }),
    );
    expect(missing.status).toBe(404);
  });

  test('set with ttl expires', async () => {
    const set = await handleCacheStoreRequest(
      cache,
      new Request('http://127.0.0.1:6112/set', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ key: 'ephemeral', value: 1, ttl: 1 }),
      }),
    );
    expect(set.status).toBe(200);

    const ttl = await handleCacheStoreRequest(
      cache,
      new Request('http://127.0.0.1:6112/ttl', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ key: 'ephemeral' }),
      }),
    );
    const ttlBody = (await ttl.json()) as { ttl: number | null };
    expect(ttlBody.ttl).toBeGreaterThanOrEqual(0);
    expect(ttlBody.ttl).toBeLessThanOrEqual(1);

    await Bun.sleep(1100);

    const get = await handleCacheStoreRequest(
      cache,
      new Request('http://127.0.0.1:6112/get', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ key: 'ephemeral' }),
      }),
    );
    expect(get.status).toBe(404);
  });

  test('del multiple keys; missing get → 404; bad input → 400', async () => {
    await handleCacheStoreRequest(
      cache,
      new Request('http://127.0.0.1:6112/set', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ key: 'a', value: 1 }),
      }),
    );
    await handleCacheStoreRequest(
      cache,
      new Request('http://127.0.0.1:6112/set', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ key: 'b', value: 2 }),
      }),
    );

    const del = await handleCacheStoreRequest(
      cache,
      new Request('http://127.0.0.1:6112/del', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ keys: ['a', 'b', 'c'] }),
      }),
    );
    expect(await del.json()).toEqual({ deleted: 2 });

    const badGet = await handleCacheStoreRequest(
      cache,
      new Request('http://127.0.0.1:6112/get', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({}),
      }),
    );
    expect(badGet.status).toBe(400);

    const badTtl = await handleCacheStoreRequest(
      cache,
      new Request('http://127.0.0.1:6112/set', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ key: 'x', value: 1, ttl: -1 }),
      }),
    );
    expect(badTtl.status).toBe(400);
  });
});
