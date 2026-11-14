import { afterAll, describe, expect, test } from 'bun:test';

import { createDb } from '@agentos/core/builtins/db-store/api/lib/create-db';
import { handleDbStoreRequest } from '@agentos/core/builtins/db-store/api/lib/handle-request';

describe('builtin db-store server', () => {
  let ctx: Awaited<ReturnType<typeof createDb>>;

  test('boots with in-memory sqlite and health OK', async () => {
    ctx = await createDb({ databasePath: ':memory:' });
    expect(ctx.dialect).toBe('sqlite');

    const health = await handleDbStoreRequest(
      ctx,
      new Request('http://127.0.0.1:6111/health'),
    );
    expect(health.status).toBe(200);
    expect(await health.json()).toEqual({ ok: true, dialect: 'sqlite' });
  });

  test('insert → query → update → delete collection docs', async () => {
    const insert = await handleDbStoreRequest(
      ctx,
      new Request('http://127.0.0.1:6111/collections/contacts/insert', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          id: 'c1',
          data: { name: 'Ada', city: 'London' },
        }),
      }),
    );
    expect(insert.status).toBe(201);
    const inserted = (await insert.json()) as {
      id: string;
      data: { name: string };
    };
    expect(inserted.id).toBe('c1');
    expect(inserted.data.name).toBe('Ada');

    await handleDbStoreRequest(
      ctx,
      new Request('http://127.0.0.1:6111/collections/contacts/insert', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          data: { name: 'Grace', city: 'London' },
        }),
      }),
    );

    const query = await handleDbStoreRequest(
      ctx,
      new Request('http://127.0.0.1:6111/collections/contacts/query', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ where: { city: 'London' } }),
      }),
    );
    expect(query.status).toBe(200);
    const queried = (await query.json()) as { items: Array<{ id: string }> };
    expect(queried.items.length).toBe(2);

    const update = await handleDbStoreRequest(
      ctx,
      new Request('http://127.0.0.1:6111/collections/contacts/update', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          id: 'c1',
          data: { title: 'Countess' },
          merge: true,
        }),
      }),
    );
    expect(update.status).toBe(200);
    const updated = (await update.json()) as {
      data: { name: string; title: string; city: string };
    };
    expect(updated.data.name).toBe('Ada');
    expect(updated.data.title).toBe('Countess');
    expect(updated.data.city).toBe('London');

    const del = await handleDbStoreRequest(
      ctx,
      new Request('http://127.0.0.1:6111/collections/contacts/delete', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: 'c1' }),
      }),
    );
    expect(del.status).toBe(200);
    expect(await del.json()).toEqual({ deleted: 1 });

    const after = await handleDbStoreRequest(
      ctx,
      new Request('http://127.0.0.1:6111/collections/contacts/query', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({}),
      }),
    );
    const afterBody = (await after.json()) as { items: Array<{ id: string }> };
    expect(afterBody.items.every((i) => i.id !== 'c1')).toBe(true);
  });

  test('duplicate insert → 409; missing update → 404; bad where → 400', async () => {
    const dup = await handleDbStoreRequest(
      ctx,
      new Request('http://127.0.0.1:6111/collections/contacts/insert', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          id: 'c1',
          data: { name: 'again' },
        }),
      }),
    );
    // c1 was deleted; re-insert then duplicate
    expect(dup.status).toBe(201);

    const dup2 = await handleDbStoreRequest(
      ctx,
      new Request('http://127.0.0.1:6111/collections/contacts/insert', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          id: 'c1',
          data: { name: 'again' },
        }),
      }),
    );
    expect(dup2.status).toBe(409);

    const missing = await handleDbStoreRequest(
      ctx,
      new Request('http://127.0.0.1:6111/collections/contacts/update', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          id: 'missing',
          data: { name: 'x' },
        }),
      }),
    );
    expect(missing.status).toBe(404);

    const badWhere = await handleDbStoreRequest(
      ctx,
      new Request('http://127.0.0.1:6111/collections/contacts/query', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ where: { $gt: { age: 1 } } }),
      }),
    );
    expect(badWhere.status).toBe(400);
  });

  afterAll(() => {
    ctx?.close();
  });
});
