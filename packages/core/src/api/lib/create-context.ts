import type { AppContext, AppRequest } from './types';

/**
 * Build a Hono-shaped request context for a matched route.
 */
export function createContext(
  request: Request,
  params: Record<string, string> = {},
): AppContext {
  const req = {
    get method() {
      return request.method;
    },
    get url() {
      return request.url;
    },
    get headers() {
      return request.headers;
    },
    get body() {
      return request.body;
    },
    get bodyUsed() {
      return request.bodyUsed;
    },
    arrayBuffer: () => request.arrayBuffer(),
    blob: () => request.blob(),
    formData: () => request.formData(),
    text: () => request.text(),
    clone: () => request.clone(),
    signal: request.signal,
    param(name: string) {
      return params[name];
    },
    json<T = unknown>() {
      return request.json() as Promise<T>;
    },
  } as AppRequest;

  return {
    req,
    params,
    json(data: unknown, init: ResponseInit = {}): Response {
      const headers = new Headers(init.headers);
      if (!headers.has('content-type')) {
        headers.set('content-type', 'application/json; charset=utf-8');
      }
      return new Response(JSON.stringify(data), { ...init, headers });
    },
  };
}
