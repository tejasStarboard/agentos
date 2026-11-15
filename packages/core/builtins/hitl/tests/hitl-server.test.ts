import { describe, expect, test } from 'bun:test';

import { createApprovalsStore } from '@agentos/core/builtins/hitl/api/lib/approvals-store';
import { handleHitlRequest } from '@agentos/core/builtins/hitl/api/lib/handle-request';

describe('builtin hitl server', () => {
  test('health OK; create → list → resolve', async () => {
    const store = createApprovalsStore();

    const health = await handleHitlRequest(
      store,
      new Request('http://127.0.0.1:6114/health'),
    );
    expect(health.status).toBe(200);
    expect(await health.json()).toEqual({ ok: true });

    const created = await handleHitlRequest(
      store,
      new Request('http://127.0.0.1:6114/approvals', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          title: 'Approve payout',
          body: '$100',
          metadata: { amount: 100 },
        }),
      }),
    );
    expect(created.status).toBe(201);
    const approval = (await created.json()) as {
      id: string;
      status: string;
      title: string;
    };
    expect(approval.status).toBe('pending');
    expect(approval.title).toBe('Approve payout');

    const listed = await handleHitlRequest(
      store,
      new Request('http://127.0.0.1:6114/approvals?status=pending'),
    );
    expect(listed.status).toBe(200);
    const listBody = (await listed.json()) as { approvals: unknown[] };
    expect(listBody.approvals).toHaveLength(1);

    const resolved = await handleHitlRequest(
      store,
      new Request(`http://127.0.0.1:6114/approvals/${approval.id}/resolve`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ decision: 'approved' }),
      }),
    );
    expect(resolved.status).toBe(200);
    expect(await resolved.json()).toMatchObject({
      id: approval.id,
      status: 'approved',
    });
  });

  test('bad create / missing / double resolve', async () => {
    const store = createApprovalsStore();

    const bad = await handleHitlRequest(
      store,
      new Request('http://127.0.0.1:6114/approvals', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({}),
      }),
    );
    expect(bad.status).toBe(400);

    const missing = await handleHitlRequest(
      store,
      new Request('http://127.0.0.1:6114/approvals/missing/resolve', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ decision: 'approved' }),
      }),
    );
    expect(missing.status).toBe(404);

    const created = await handleHitlRequest(
      store,
      new Request('http://127.0.0.1:6114/approvals', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ title: 'Once' }),
      }),
    );
    const { id } = (await created.json()) as { id: string };

    await handleHitlRequest(
      store,
      new Request(`http://127.0.0.1:6114/approvals/${id}/resolve`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ decision: 'rejected' }),
      }),
    );

    const again = await handleHitlRequest(
      store,
      new Request(`http://127.0.0.1:6114/approvals/${id}/resolve`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ decision: 'approved' }),
      }),
    );
    expect(again.status).toBe(409);
  });
});
