import { describe, expect, test } from 'bun:test';

import { createEventBus } from '@agentos/core/builtins/events/api/lib/event-bus';
import { handleEventsRequest } from '@agentos/core/builtins/events/api/lib/handle-request';

describe('builtin events server', () => {
  test('health + publish', async () => {
    const bus = createEventBus();

    const health = await handleEventsRequest(
      bus,
      new Request('http://127.0.0.1:6115/health'),
    );
    expect(health.status).toBe(200);
    expect(await health.json()).toEqual({ ok: true, subscribers: 0 });

    const published = await handleEventsRequest(
      bus,
      new Request('http://127.0.0.1:6115/publish', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ topic: 'demo', payload: { n: 1 } }),
      }),
    );
    expect(published.status).toBe(200);
    const body = (await published.json()) as {
      ok: boolean;
      event: { topic: string; payload: unknown };
    };
    expect(body.ok).toBe(true);
    expect(body.event.topic).toBe('demo');
    expect(body.event.payload).toEqual({ n: 1 });
  });

  test('SSE subscribe receives publish', async () => {
    const bus = createEventBus();

    const subRes = await handleEventsRequest(
      bus,
      new Request('http://127.0.0.1:6115/subscribe?topic=demo'),
    );
    expect(subRes.status).toBe(200);
    expect(subRes.headers.get('content-type')).toContain('text/event-stream');

    const reader = subRes.body!.getReader();
    const decoder = new TextDecoder();

    // Drain greeting
    await reader.read();

    const published = handleEventsRequest(
      bus,
      new Request('http://127.0.0.1:6115/publish', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ topic: 'demo', payload: { hello: true } }),
      }),
    );

    const { value } = await reader.read();
    await published;
    const text = decoder.decode(value);
    expect(text).toContain('event: message');
    expect(text).toContain('"topic":"demo"');
    await reader.cancel();
  });

  test('publish without topic → 400', async () => {
    const bus = createEventBus();
    const bad = await handleEventsRequest(
      bus,
      new Request('http://127.0.0.1:6115/publish', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({}),
      }),
    );
    expect(bad.status).toBe(400);
  });
});
