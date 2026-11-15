import { AUDIT_COLLECTION } from './constants';

export type AuditEntryInput = {
  action: string;
  actor?: string;
  resource?: string;
  meta?: Record<string, unknown>;
};

export type AuditEntry = AuditEntryInput & {
  id: string;
  at: string;
};

export type DbStoreClient = {
  insert: (entry: AuditEntry) => Promise<AuditEntry>;
  query: (limit?: number) => Promise<AuditEntry[]>;
};

export function createDbStoreClient(baseUrl: string): DbStoreClient {
  const root = baseUrl.replace(/\/+$/, '');

  return {
    async insert(entry) {
      const res = await fetch(
        `${root}/collections/${AUDIT_COLLECTION}/insert`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ id: entry.id, data: entry }),
        },
      );
      if (!res.ok) {
        const detail = await res.text();
        throw new Error(
          `db-store insert failed (${res.status}): ${detail || res.statusText}`,
        );
      }
      return entry;
    },

    async query(limit = 50) {
      const res = await fetch(`${root}/collections/${AUDIT_COLLECTION}/query`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ limit }),
      });
      if (!res.ok) {
        const detail = await res.text();
        throw new Error(
          `db-store query failed (${res.status}): ${detail || res.statusText}`,
        );
      }
      const body = (await res.json()) as {
        items?: Array<{ id: string; data: Record<string, unknown> }>;
        documents?: Array<{ id: string; data: Record<string, unknown> }>;
      };
      const docs = body.items ?? body.documents ?? [];
      return docs.map((doc) => {
        const data = doc.data ?? {};
        return {
          id: doc.id,
          action: typeof data.action === 'string' ? data.action : '',
          actor: typeof data.actor === 'string' ? data.actor : undefined,
          resource:
            typeof data.resource === 'string' ? data.resource : undefined,
          meta:
            data.meta &&
            typeof data.meta === 'object' &&
            !Array.isArray(data.meta)
              ? (data.meta as Record<string, unknown>)
              : undefined,
          at: typeof data.at === 'string' ? data.at : '',
        };
      });
    },
  };
}
