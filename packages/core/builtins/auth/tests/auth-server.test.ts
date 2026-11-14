import { afterAll, describe, expect, test } from 'bun:test';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  DEMO_ADMIN,
  DEMO_VIEWER,
  PERMISSION_ADMIN_ONLY,
} from '@agentos/core/builtins/auth/api/lib/constants';
import { createAuth } from '@agentos/core/builtins/auth/api/lib/create-auth';
import { handleAuthRequest } from '@agentos/core/builtins/auth/api/lib/handle-request';

function cookieHeaderFrom(response: Response): string {
  const cookies =
    typeof response.headers.getSetCookie === 'function'
      ? response.headers.getSetCookie()
      : [];
  return cookies.map((c) => c.split(';')[0]).join('; ');
}

describe('builtin auth server', () => {
  const dir = mkdtempSync(join(tmpdir(), 'agentos-auth-'));
  const dbPath = join(dir, 'auth.sqlite');
  let ctx: Awaited<ReturnType<typeof createAuth>>;

  test('boots with seeded demo users', async () => {
    ctx = await createAuth({
      databasePath: dbPath,
      baseURL: 'http://127.0.0.1:6110',
      secret: 'test-secret-at-least-32-characters-long!!',
    });
    const health = await handleAuthRequest(
      ctx,
      new Request('http://127.0.0.1:6110/health'),
    );
    expect(health.status).toBe(200);
    expect(await health.json()).toEqual({ ok: true });
  });

  test('sign-in → session cookie → GET /session returns user + roles', async () => {
    const signIn = await handleAuthRequest(
      ctx,
      new Request('http://127.0.0.1:6110/sign-in', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: DEMO_ADMIN.email,
          password: DEMO_ADMIN.password,
        }),
      }),
    );
    expect(signIn.status).toBe(200);
    const cookie = cookieHeaderFrom(signIn);
    expect(cookie.length).toBeGreaterThan(0);

    const body = (await signIn.json()) as {
      user: { email: string };
      roles: string[];
    };
    expect(body.user.email).toBe(DEMO_ADMIN.email);
    expect(body.roles).toContain('admin');

    const session = await handleAuthRequest(
      ctx,
      new Request('http://127.0.0.1:6110/session', {
        headers: { cookie },
      }),
    );
    expect(session.status).toBe(200);
    const sessionBody = (await session.json()) as {
      user: { email: string };
      roles: string[];
    };
    expect(sessionBody.user.email).toBe(DEMO_ADMIN.email);
    expect(sessionBody.roles).toContain('admin');
  });

  test('unauthenticated /permissions/check → 401', async () => {
    const res = await handleAuthRequest(
      ctx,
      new Request('http://127.0.0.1:6110/permissions/check', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ permission: PERMISSION_ADMIN_ONLY }),
      }),
    );
    expect(res.status).toBe(401);
  });

  test('viewer denied admin permission; admin allowed', async () => {
    const viewerSignIn = await handleAuthRequest(
      ctx,
      new Request('http://127.0.0.1:6110/sign-in', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: DEMO_VIEWER.email,
          password: DEMO_VIEWER.password,
        }),
      }),
    );
    expect(viewerSignIn.status).toBe(200);
    const viewerCookie = cookieHeaderFrom(viewerSignIn);

    const denied = await handleAuthRequest(
      ctx,
      new Request('http://127.0.0.1:6110/permissions/check', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          cookie: viewerCookie,
        },
        body: JSON.stringify({ permission: PERMISSION_ADMIN_ONLY }),
      }),
    );
    expect(denied.status).toBe(200);
    expect(await denied.json()).toEqual({
      allowed: false,
      permission: PERMISSION_ADMIN_ONLY,
    });

    const adminSignIn = await handleAuthRequest(
      ctx,
      new Request('http://127.0.0.1:6110/sign-in', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: DEMO_ADMIN.email,
          password: DEMO_ADMIN.password,
        }),
      }),
    );
    const adminCookie = cookieHeaderFrom(adminSignIn);
    const allowed = await handleAuthRequest(
      ctx,
      new Request('http://127.0.0.1:6110/permissions/check', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          cookie: adminCookie,
        },
        body: JSON.stringify({ permission: PERMISSION_ADMIN_ONLY }),
      }),
    );
    expect(allowed.status).toBe(200);
    expect(await allowed.json()).toEqual({
      allowed: true,
      permission: PERMISSION_ADMIN_ONLY,
    });
  });

  test('GET /me aliases /session', async () => {
    const signIn = await handleAuthRequest(
      ctx,
      new Request('http://127.0.0.1:6110/sign-in', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: DEMO_ADMIN.email,
          password: DEMO_ADMIN.password,
        }),
      }),
    );
    const cookie = cookieHeaderFrom(signIn);
    const me = await handleAuthRequest(
      ctx,
      new Request('http://127.0.0.1:6110/me', { headers: { cookie } }),
    );
    expect(me.status).toBe(200);
    const body = (await me.json()) as { user: { email: string } };
    expect(body.user.email).toBe(DEMO_ADMIN.email);
  });

  afterAll(() => {
    ctx?.db.close();
    rmSync(dir, { recursive: true, force: true });
  });
});
