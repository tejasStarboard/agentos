import type { AuditEntryInput, DbStoreClient } from './db-store-client';

function json(data: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  if (!headers.has('content-type')) {
    headers.set('content-type', 'application/json; charset=utf-8');
  }
  return new Response(JSON.stringify(data), { ...init, headers });
}

async function readJsonBody(
  request: Request,
): Promise<Record<string, unknown> | null> {
  try {
    const body = (await request.json()) as unknown;
    if (body && typeof body === 'object' && !Array.isArray(body)) {
      return body as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
}

export type AuditContext = {
  db: DbStoreClient;
};

/**
 * Thin Bun request router for `/api/ext/audit/*` upstream paths.
 * Persistence goes through db-store only (ADR 004).
 */
export async function handleAuditRequest(
  ctx: AuditContext,
  request: Request,
): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, '') || '/';
  const method = request.method.toUpperCase();

  if (method === 'GET' && path === '/health') {
    return json({ ok: true, backend: 'db-store' });
  }

  if (method === 'POST' && path === '/entries') {
    const body = await readJsonBody(request);
    const action = typeof body?.action === 'string' ? body.action.trim() : '';
    if (!action) {
      return json({ error: 'action required' }, { status: 400 });
    }
    const input: AuditEntryInput = {
      action,
      actor: typeof body?.actor === 'string' ? body.actor : undefined,
      resource: typeof body?.resource === 'string' ? body.resource : undefined,
      meta:
        body?.meta && typeof body.meta === 'object' && !Array.isArray(body.meta)
          ? (body.meta as Record<string, unknown>)
          : undefined,
    };
    const entry = {
      id: crypto.randomUUID(),
      ...input,
      at: new Date().toISOString(),
    };
    try {
      const saved = await ctx.db.insert(entry);
      return json(saved, { status: 201 });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return json(
        { error: 'db-store unavailable', detail: message },
        { status: 502 },
      );
    }
  }

  if (method === 'GET' && path === '/entries') {
    const limitRaw = url.searchParams.get('limit');
    const limit =
      limitRaw && Number.isFinite(Number(limitRaw))
        ? Math.max(1, Math.min(200, Number(limitRaw)))
        : 50;
    try {
      const entries = await ctx.db.query(limit);
      return json({ entries });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return json(
        { error: 'db-store unavailable', detail: message },
        { status: 502 },
      );
    }
  }

  return json({ error: 'not found' }, { status: 404 });
}
