import type { NotificationType, NotifyStore } from './notify-store';

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

/**
 * Thin Bun request router for `/api/ext/notifications/*` upstream paths.
 */
export async function handleNotificationsRequest(
  store: NotifyStore,
  request: Request,
): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, '') || '/';
  const method = request.method.toUpperCase();

  if (method === 'GET' && path === '/health') {
    return json({ ok: true });
  }

  if (method === 'GET' && path === '/recent') {
    return json({ notifications: store.list() });
  }

  if (method === 'POST' && path === '/notify') {
    const body = await readJsonBody(request);
    const message =
      typeof body?.message === 'string' ? body.message.trim() : '';
    if (!message) {
      return json({ error: 'message required' }, { status: 400 });
    }
    const typeRaw = body?.type;
    const type: NotificationType =
      typeRaw === 'success' || typeRaw === 'error' || typeRaw === 'info'
        ? typeRaw
        : 'info';
    const entry = store.add(message, type);
    return json({ ok: true, notification: entry });
  }

  return json({ error: 'not found' }, { status: 404 });
}
