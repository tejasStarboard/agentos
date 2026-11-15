/**
 * @agentos/core/api/http — gateway URL helpers + JSON fetch for API kit clients.
 */

export const DEFAULT_GATEWAY = 'http://127.0.0.1:5173';

export type EnvMap = Record<string, string | undefined>;

/** Resolve Shell gateway origin (`AGENT_OS_GLOBAL_GATEWAY_URL` or local Vite default). */
export function resolveGatewayUrl(env: EnvMap = Bun.env): string {
  return (env.AGENT_OS_GLOBAL_GATEWAY_URL ?? DEFAULT_GATEWAY).replace(
    /\/$/,
    '',
  );
}

/**
 * Resolve builtin/extension API base: `AGENT_OS_*_API_BASE` override, else
 * `{gateway}/api/ext/{extId}`.
 */
export function resolveExtApiBase(
  extId: string,
  overrideEnvKey: string,
  env: EnvMap = Bun.env,
): string {
  const override = env[overrideEnvKey];
  if (override) {
    return override.replace(/\/$/, '');
  }
  return `${resolveGatewayUrl(env)}/api/ext/${extId}`;
}

export type JsonFetchInit = {
  method?: string;
  body?: unknown;
  headers?: HeadersInit;
  /** When true, skip JSON parse on empty body. */
  allowEmpty?: boolean;
};

/**
 * `fetch` + JSON parse; throws on non-OK with status + body text.
 */
export async function jsonFetch<T>(
  url: string,
  init: JsonFetchInit = {},
  label = 'request',
): Promise<T> {
  const headers = new Headers(init.headers);
  const method = (
    init.method ?? (init.body !== undefined ? 'POST' : 'GET')
  ).toUpperCase();
  let body: BodyInit | undefined;
  if (init.body !== undefined) {
    if (!headers.has('content-type')) {
      headers.set('content-type', 'application/json');
    }
    body =
      typeof init.body === 'string' ? init.body : JSON.stringify(init.body);
  }

  const res = await fetch(url, { method, headers, body });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(
      `${label} failed (${res.status}): ${detail || res.statusText}`,
    );
  }

  if (init.allowEmpty && res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  if (!text) {
    if (init.allowEmpty) return undefined as T;
    throw new Error(`${label} failed: empty response body`);
  }
  return JSON.parse(text) as T;
}

/** POST JSON helper used by domain clients. */
export async function postJson<T>(
  url: string,
  body: unknown,
  label: string,
): Promise<T> {
  return jsonFetch<T>(url, { method: 'POST', body: body ?? {} }, label);
}

/** GET JSON helper used by domain clients. */
export async function getJson<T>(url: string, label: string): Promise<T> {
  return jsonFetch<T>(url, { method: 'GET' }, label);
}
