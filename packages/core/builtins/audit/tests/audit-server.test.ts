import { describe, expect, test } from 'bun:test';

import type {
  AuditEntry,
  DbStoreClient,
} from '@agentos/core/builtins/audit/api/lib/db-store-client';
import { handleAuditRequest } from '@agentos/core/builtins/audit/api/lib/handle-request';

function mockDb(fail = false): DbStoreClient & { entries: AuditEntry[] } {
  const entries: AuditEntry[] = [];
  return {
    entries,
    async insert(entry) {
      if (fail) throw new Error('connection refused');
      entries.push(entry);
      return entry;
    },
    async query(limit = 50) {
      if (fail) throw new Error('connection refused');
      return entries.slice(0, limit);
    },
  };
}

describe('builtin audit server', () => {
  test('append + list via db-store client', async () => {
    const db = mockDb();

    const health = await handleAuditRequest(
      { db },
      new Request('http://127.0.0.1:6119/health'),
    );
    expect(await health.json()).toEqual({ ok: true, backend: 'db-store' });

    const created = await handleAuditRequest(
      { db },
      new Request('http://127.0.0.1:6119/entries', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          action: 'approval.resolved',
          actor: 'user-1',
          resource: 'approval:abc',
          meta: { decision: 'approved' },
        }),
      }),
    );
    expect(created.status).toBe(201);
    const entry = (await created.json()) as AuditEntry;
    expect(entry.action).toBe('approval.resolved');
    expect(db.entries).toHaveLength(1);

    const listed = await handleAuditRequest(
      { db },
      new Request('http://127.0.0.1:6119/entries'),
    );
    expect(listed.status).toBe(200);
    expect(await listed.json()).toEqual({ entries: db.entries });
  });

  test('bad input + db-store down', async () => {
    const okDb = mockDb();
    const bad = await handleAuditRequest(
      { db: okDb },
      new Request('http://127.0.0.1:6119/entries', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({}),
      }),
    );
    expect(bad.status).toBe(400);

    const down = mockDb(true);
    const fail = await handleAuditRequest(
      { db: down },
      new Request('http://127.0.0.1:6119/entries', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: 'x' }),
      }),
    );
    expect(fail.status).toBe(502);
  });
});
