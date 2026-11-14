import type { IncomingMessage, ServerResponse } from 'node:http';

import type {
  ConnectMiddleware,
  ExtensionEnableState,
} from './extension-enable-state';
import type { RegistryModel, ScannedExtension } from './types';

/** Gateway prefix for extension API reverse-proxy. */
export const EXT_API_PREFIX = '/api/ext';

export type ParsedExtApiPath = {
  extensionId: string;
  /** Path forwarded to upstream (starts with `/`, or `/` when empty). */
  targetPath: string;
  /** Includes leading `?` when present; otherwise empty. */
  search: string;
};

const EXT_API_PATH_RE = /^\/api\/ext\/([^/]+)(\/.*)?$/;

/** Parse `/api/ext/:id/*` (+ query) into id, upstream path, and search. */
export function parseExtApiPath(url: string): ParsedExtApiPath | null {
  const qIndex = url.indexOf('?');
  const pathname = qIndex === -1 ? url : url.slice(0, qIndex);
  const search = qIndex === -1 ? '' : url.slice(qIndex);
  const match = EXT_API_PATH_RE.exec(pathname);
  if (!match?.[1]) return null;

  let extensionId: string;
  try {
    extensionId = decodeURIComponent(match[1]);
  } catch {
    return null;
  }

  const rest = match[2] ?? '';
  const targetPath = rest === '' ? '/' : rest;

  return { extensionId, targetPath, search };
}

/** Fetch-compatible function injected for tests. */
export type ProxyFetch = (
  input: string,
  init?: RequestInit,
) => Promise<Response>;

const HOP_BY_HOP = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailers',
  'transfer-encoding',
  'upgrade',
  'host',
  'content-length',
]);

function upstreamPort(extension: ScannedExtension): number | undefined {
  const port = extension.meta.api?.port ?? extension.service?.port;
  return typeof port === 'number' && Number.isFinite(port) ? port : undefined;
}

function readRequestBody(req: IncomingMessage): Promise<Buffer | undefined> {
  const method = (req.method ?? 'GET').toUpperCase();
  if (method === 'GET' || method === 'HEAD') {
    return Promise.resolve(undefined);
  }
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer | string) => {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    });
    req.on('end', () => {
      resolve(chunks.length === 0 ? undefined : Buffer.concat(chunks));
    });
    req.on('error', reject);
  });
}

function collectForwardHeaders(req: IncomingMessage): Headers {
  const headers = new Headers();
  for (const [name, value] of Object.entries(req.headers)) {
    if (value == null) continue;
    const lower = name.toLowerCase();
    if (HOP_BY_HOP.has(lower)) continue;
    if (Array.isArray(value)) {
      for (const v of value) headers.append(name, v);
    } else {
      headers.set(name, value);
    }
  }
  return headers;
}

function sendPlain(res: ServerResponse, status: number, message: string): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end(message);
}

/**
 * Connect middleware: `ALL /api/ext/:id/*` → `http://127.0.0.1:<port>/<remainder>`.
 * Disabled customer extensions get 403; builtins always proxy.
 */
export function createExtApiProxyMiddleware(
  getModel: () => RegistryModel,
  state: ExtensionEnableState,
  fetchImpl: ProxyFetch = globalThis.fetch,
): ConnectMiddleware {
  return (req, res, next) => {
    const url = req.url ?? '';
    const parsed = parseExtApiPath(url);
    if (!parsed) {
      next();
      return;
    }

    const extension = getModel().extensions.find(
      (ext) => ext.id === parsed.extensionId,
    );
    if (!extension) {
      sendPlain(res, 404, `Unknown extension: ${parsed.extensionId}`);
      return;
    }

    if (!state.isEnabled(extension)) {
      sendPlain(res, 403, `Extension disabled: ${parsed.extensionId}`);
      return;
    }

    const port = upstreamPort(extension);
    if (port == null) {
      sendPlain(
        res,
        502,
        `No upstream port configured for extension: ${parsed.extensionId}`,
      );
      return;
    }

    const targetUrl = `http://127.0.0.1:${port}${parsed.targetPath}${parsed.search}`;

    void (async () => {
      const body = await readRequestBody(req);
      const headers = collectForwardHeaders(req);
      const method = (req.method ?? 'GET').toUpperCase();

      let upstream: Response;
      try {
        upstream = await fetchImpl(targetUrl, {
          method,
          headers,
          body:
            body && method !== 'GET' && method !== 'HEAD' ? body : undefined,
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Upstream request failed';
        sendPlain(
          res,
          502,
          `Bad gateway for ${parsed.extensionId}: ${message}`,
        );
        return;
      }

      res.statusCode = upstream.status;
      upstream.headers.forEach((value, name) => {
        if (HOP_BY_HOP.has(name.toLowerCase())) return;
        res.setHeader(name, value);
      });

      if (method === 'HEAD') {
        res.end();
        return;
      }

      const buf = Buffer.from(await upstream.arrayBuffer());
      res.end(buf);
    })().catch((err) => {
      next(err);
    });
  };
}
