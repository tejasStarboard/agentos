/**
 * Cache backend surface — in-memory for v1; same methods for a Redis backend later.
 */
export type CacheBackend = {
  get(key: string): unknown | undefined;
  set(key: string, value: unknown, ttlSeconds?: number): void;
  del(keys: string[]): number;
  /** Remaining TTL in seconds, or `null` if missing / no expiry. */
  ttl(key: string): number | null;
};

type Entry = {
  value: unknown;
  /** Unix ms expiry; `null` = no expiry. */
  expiresAt: number | null;
};

export type MemoryCache = CacheBackend & {
  backend: 'memory';
  size(): number;
};

/**
 * In-memory Map cache with lazy expiry on read.
 */
export function createMemoryCache(): MemoryCache {
  const store = new Map<string, Entry>();

  function isExpired(entry: Entry, now = Date.now()): boolean {
    return entry.expiresAt !== null && entry.expiresAt <= now;
  }

  function getLive(key: string): Entry | undefined {
    const entry = store.get(key);
    if (!entry) return undefined;
    if (isExpired(entry)) {
      store.delete(key);
      return undefined;
    }
    return entry;
  }

  return {
    backend: 'memory',

    get(key: string): unknown | undefined {
      const entry = getLive(key);
      return entry?.value;
    },

    set(key: string, value: unknown, ttlSeconds?: number): void {
      let expiresAt: number | null = null;
      if (ttlSeconds !== undefined) {
        if (
          typeof ttlSeconds !== 'number' ||
          !Number.isFinite(ttlSeconds) ||
          ttlSeconds <= 0
        ) {
          throw new CacheError('ttl must be a positive number of seconds', 400);
        }
        expiresAt = Date.now() + Math.floor(ttlSeconds) * 1000;
      }
      store.set(key, { value, expiresAt });
    },

    del(keys: string[]): number {
      let deleted = 0;
      for (const key of keys) {
        if (store.delete(key)) deleted += 1;
      }
      return deleted;
    },

    ttl(key: string): number | null {
      const entry = getLive(key);
      if (!entry) return null;
      if (entry.expiresAt === null) return null;
      const remainingMs = entry.expiresAt - Date.now();
      return Math.max(0, Math.ceil(remainingMs / 1000));
    },

    size(): number {
      // Opportunistic sweep so size reflects live keys.
      for (const [key, entry] of store) {
        if (isExpired(entry)) store.delete(key);
      }
      return store.size;
    },
  };
}

export class CacheError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'CacheError';
    this.status = status;
  }
}
