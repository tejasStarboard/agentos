import { describe, expect, test } from 'bun:test';
import { join } from 'node:path';

import { createApp, folderPathToPattern, loadRoutes } from '@agentos/core/api';

const fixturesDir = join(import.meta.dir, 'fixtures', 'routes');

describe('folderPathToPattern', () => {
  test('maps static and [param] segments', () => {
    expect(folderPathToPattern('tools/search_contacts')).toBe(
      '/tools/search_contacts',
    );
    expect(folderPathToPattern('contacts/[id]')).toBe('/contacts/:id');
    expect(folderPathToPattern('')).toBe('/');
  });
});

describe('loadRoutes', () => {
  test('loads static, param, middleware, and health override routes', async () => {
    const app = createApp();
    await loadRoutes(app, fixturesDir);

    const health = await app.fetch(new Request('http://localhost/health'));
    expect(health.status).toBe(200);
    expect(await health.json()).toEqual({ ok: true, source: 'file-route' });

    const search = await app.fetch(
      new Request('http://localhost/tools/search_contacts', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ q: 'ada' }),
      }),
    );
    expect(search.status).toBe(200);
    expect(await search.json()).toEqual({
      ok: true,
      tool: 'search_contacts',
      input: { q: 'ada' },
    });

    const contact = await app.fetch(
      new Request('http://localhost/contacts/abc'),
    );
    expect(contact.status).toBe(200);
    expect(await contact.json()).toEqual({ id: 'abc' });

    const del = await app.fetch(
      new Request('http://localhost/contacts/abc', { method: 'DELETE' }),
    );
    expect(del.status).toBe(200);
    expect(await del.json()).toEqual({ deleted: 'abc' });

    const denied = await app.fetch(new Request('http://localhost/secure/ping'));
    expect(denied.status).toBe(401);

    const allowed = await app.fetch(
      new Request('http://localhost/secure/ping', {
        headers: { 'x-token': 'secret' },
      }),
    );
    expect(allowed.status).toBe(200);
    expect(await allowed.json()).toEqual({ pong: true });
  });

  test('missing routes dir is a no-op', async () => {
    const app = createApp();
    await loadRoutes(app, join(fixturesDir, 'does-not-exist'));
    const res = await app.fetch(new Request('http://localhost/health'));
    expect(await res.json()).toEqual({ ok: true });
  });
});
