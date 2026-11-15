import type { EventBus } from './event-bus';

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
 * Thin Bun request router for `/api/ext/events/*` upstream paths.
 */
export async function handleEventsRequest(
  bus: EventBus,
  request: Request,
): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, '') || '/';
  const method = request.method.toUpperCase();

  if (method === 'GET' && path === '/health') {
    return json({ ok: true, subscribers: bus.subscriberCount });
  }

  if (method === 'POST' && path === '/publish') {
    const body = await readJsonBody(request);
    const topic = typeof body?.topic === 'string' ? body.topic.trim() : '';
    if (!topic) {
      return json({ error: 'topic required' }, { status: 400 });
    }
    const msg = bus.publish(topic, body?.payload ?? null);
    return json({ ok: true, event: msg });
  }

  if (method === 'GET' && path === '/subscribe') {
    const topicParam = url.searchParams.get('topic');
    const topicsParam = url.searchParams.getAll('topics');
    const topics =
      topicsParam.length > 0 ? topicsParam : topicParam ? [topicParam] : null;
    const { stream } = bus.subscribe(topics);
    return new Response(stream, {
      headers: {
        'content-type': 'text/event-stream; charset=utf-8',
        'cache-control': 'no-cache',
        connection: 'keep-alive',
      },
    });
  }

  return json({ error: 'not found' }, { status: 404 });
}
