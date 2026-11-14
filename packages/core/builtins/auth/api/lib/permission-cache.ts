/** Soft-fail HTTP client for optional permission caching via cache-store. */

export type PermissionCacheFetch = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>;

export type PermissionCacheConfig = {
  /** e.g. `http://127.0.0.1:6112` */
  baseUrl: string;
  /** Default 30s. */
  ttlSeconds?: number;
  /** Injected for tests. */
  fetchImpl?: PermissionCacheFetch;
};

export const DEFAULT_PERMISSION_CACHE_TTL_SECONDS = 30;

export function permissionCacheKey(userId: string, permission: string): string {
  return `auth:perm:${userId}:${permission}`;
}

/**
 * Best-effort GET from cache-store. Returns `undefined` on miss / error.
 */
export async function cacheGetAllowed(
  config: PermissionCacheConfig,
  userId: string,
  permission: string,
): Promise<boolean | undefined> {
  const fetchImpl = config.fetchImpl ?? fetch;
  const key = permissionCacheKey(userId, permission);
  try {
    const res = await fetchImpl(new URL('/get', config.baseUrl).toString(), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ key }),
    });
    if (!res.ok) return undefined;
    const body = (await res.json()) as { value?: unknown };
    if (
      body.value &&
      typeof body.value === 'object' &&
      !Array.isArray(body.value) &&
      typeof (body.value as { allowed?: unknown }).allowed === 'boolean'
    ) {
      return (body.value as { allowed: boolean }).allowed;
    }
    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * Best-effort SET into cache-store. Ignores all failures.
 */
export async function cacheSetAllowed(
  config: PermissionCacheConfig,
  userId: string,
  permission: string,
  allowed: boolean,
): Promise<void> {
  const fetchImpl = config.fetchImpl ?? fetch;
  const key = permissionCacheKey(userId, permission);
  const ttl = config.ttlSeconds ?? DEFAULT_PERMISSION_CACHE_TTL_SECONDS;
  try {
    await fetchImpl(new URL('/set', config.baseUrl).toString(), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        key,
        value: { allowed },
        ttl,
      }),
    });
  } catch {
    // soft-fail
  }
}
