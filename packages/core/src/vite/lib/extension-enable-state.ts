import type { IncomingMessage, ServerResponse } from 'node:http';

import type { RegistryModel, ScannedExtension } from './types';

export type ConnectMiddleware = (
  req: IncomingMessage,
  res: ServerResponse,
  next: (err?: unknown) => void,
) => void;

/** In-memory enable/disable map for customer extensions (Vite gateway process). */
export type ExtensionEnableState = {
  /** Explicit overrides; missing keys default to enabled. */
  readonly enabledById: Map<string, boolean>;
  isEnabled(extension: ScannedExtension): boolean;
  setEnabled(extensionId: string, enabled: boolean): void;
};

/** Create an empty enable map (defaults: all extensions enabled). */
export function createExtensionEnableState(): ExtensionEnableState {
  const enabledById = new Map<string, boolean>();

  return {
    enabledById,
    isEnabled(extension) {
      if (extension.kind === 'builtin' || !extension.toggleable) {
        return true;
      }
      const explicit = enabledById.get(extension.id);
      return explicit !== false;
    },
    setEnabled(extensionId, enabled) {
      enabledById.set(extensionId, enabled);
    },
  };
}

const ENABLE_PATH_RE = /^\/api\/extensions\/([^/]+)\/enable\/?$/;

/** Parse `POST /api/extensions/:id/enable` pathname → extension id. */
export function parseExtensionEnablePath(
  pathname: string,
): { extensionId: string } | null {
  const match = ENABLE_PATH_RE.exec(pathname);
  if (!match?.[1]) return null;
  try {
    return { extensionId: decodeURIComponent(match[1]) };
  } catch {
    return null;
  }
}

function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer | string) => {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    });
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8').trim();
      if (!raw) {
        resolve(undefined);
        return;
      }
      try {
        resolve(JSON.parse(raw) as unknown);
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(
  res: ServerResponse,
  status: number,
  body: Record<string, unknown>,
): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

/**
 * Connect middleware: `POST /api/extensions/:id/enable` with `{ enabled: boolean }`.
 * Builtins / non-toggleable extensions cannot be disabled (403).
 */
export function createExtensionEnableMiddleware(
  getModel: () => RegistryModel,
  state: ExtensionEnableState,
): ConnectMiddleware {
  return (req, res, next) => {
    const url = req.url ?? '';
    const pathname = url.split('?')[0] ?? url;
    const parsed = parseExtensionEnablePath(pathname);
    if (!parsed) {
      next();
      return;
    }

    if (req.method !== 'POST') {
      res.statusCode = 405;
      res.setHeader('Allow', 'POST');
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('Method Not Allowed');
      return;
    }

    void (async () => {
      const extension = getModel().extensions.find(
        (ext) => ext.id === parsed.extensionId,
      );
      if (!extension) {
        sendJson(res, 404, {
          error: `Unknown extension: ${parsed.extensionId}`,
        });
        return;
      }

      let body: unknown;
      try {
        body = await readJsonBody(req);
      } catch {
        sendJson(res, 400, { error: 'Invalid JSON body' });
        return;
      }

      const enabled =
        typeof body === 'object' &&
        body !== null &&
        'enabled' in body &&
        typeof (body as { enabled: unknown }).enabled === 'boolean'
          ? (body as { enabled: boolean }).enabled
          : undefined;

      if (enabled === undefined) {
        sendJson(res, 400, { error: 'Body must include boolean "enabled"' });
        return;
      }

      if (!enabled && (extension.kind === 'builtin' || !extension.toggleable)) {
        sendJson(res, 403, {
          error: `Cannot disable ${extension.kind} extension: ${extension.id}`,
        });
        return;
      }

      if (extension.kind === 'builtin' || !extension.toggleable) {
        // Builtins stay enabled; ignore redundant enable=true.
        state.setEnabled(extension.id, true);
      } else {
        state.setEnabled(extension.id, enabled);
      }

      sendJson(res, 200, {
        id: extension.id,
        enabled: state.isEnabled(extension),
      });
    })().catch((err) => {
      next(err);
    });
  };
}
