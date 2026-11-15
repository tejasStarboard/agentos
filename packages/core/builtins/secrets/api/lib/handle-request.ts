import { resolveSecret } from './resolve-secret';

function json(data: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  if (!headers.has('content-type')) {
    headers.set('content-type', 'application/json; charset=utf-8');
  }
  return new Response(JSON.stringify(data), { ...init, headers });
}

function parseSecretPath(path: string): string | null {
  const match = path.match(/^\/secrets\/([^/]+)$/);
  if (!match?.[1]) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}

export type SecretsContext = {
  runtimeEnv: Record<string, string | undefined>;
};

/**
 * Thin Bun request router for `/api/ext/secrets/*` upstream paths.
 */
export async function handleSecretsRequest(
  ctx: SecretsContext,
  request: Request,
): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, '') || '/';
  const method = request.method.toUpperCase();

  if (method === 'GET' && path === '/health') {
    return json({ ok: true });
  }

  const key = parseSecretPath(path);
  if (method === 'GET' && key) {
    const value = resolveSecret(key, ctx.runtimeEnv);
    if (value === null) {
      return json({ error: 'not found' }, { status: 404 });
    }
    return json({ key, value });
  }

  return json({ error: 'not found' }, { status: 404 });
}
