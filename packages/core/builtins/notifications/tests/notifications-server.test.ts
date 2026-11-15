import { describe, expect, test } from 'bun:test';

import { handleNotificationsRequest } from '@agentos/core/builtins/notifications/api/lib/handle-request';
import { createNotifyStore } from '@agentos/core/builtins/notifications/api/lib/notify-store';

describe('builtin notifications server', () => {
  test('notify → recent; bad input → 400', async () => {
    const store = createNotifyStore();

    const health = await handleNotificationsRequest(
      store,
      new Request('http://127.0.0.1:6117/health'),
    );
    expect(await health.json()).toEqual({ ok: true });

    const notify = await handleNotificationsRequest(
      store,
      new Request('http://127.0.0.1:6117/notify', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message: 'Saved', type: 'success' }),
      }),
    );
    expect(notify.status).toBe(200);
    expect(await notify.json()).toMatchObject({
      ok: true,
      notification: { message: 'Saved', type: 'success' },
    });

    const recent = await handleNotificationsRequest(
      store,
      new Request('http://127.0.0.1:6117/recent'),
    );
    const body = (await recent.json()) as { notifications: unknown[] };
    expect(body.notifications).toHaveLength(1);

    const bad = await handleNotificationsRequest(
      store,
      new Request('http://127.0.0.1:6117/notify', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({}),
      }),
    );
    expect(bad.status).toBe(400);
  });
});
