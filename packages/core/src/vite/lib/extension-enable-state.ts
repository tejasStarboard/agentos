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

/** True when the extension must stay enabled (driven builtins / non-toggleable). */
export function isLockedExtension(extension: ScannedExtension): boolean {
  return (
    extension.driven || extension.kind === 'builtin' || !extension.toggleable
  );
}

/** Create an empty enable map (defaults: all extensions enabled). */
export function createExtensionEnableState(): ExtensionEnableState {
  const enabledById = new Map<string, boolean>();

  return {
    enabledById,
    isEnabled(extension) {
      if (isLockedExtension(extension)) {
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

/** Read and parse a JSON request body (empty body → undefined). */
export function readJsonBody(req: IncomingMessage): Promise<unknown> {
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

/** Write a JSON response. */
export function sendJson(
  res: ServerResponse,
  status: number,
  body: Record<string, unknown>,
): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

/** Extract boolean `enabled` from a JSON body, or undefined if invalid. */
export function parseEnabledFlag(body: unknown): boolean | undefined {
  if (
    typeof body === 'object' &&
    body !== null &&
    'enabled' in body &&
    typeof (body as { enabled: unknown }).enabled === 'boolean'
  ) {
    return (body as { enabled: boolean }).enabled;
  }
  return undefined;
}

export type ApplyEnableResult =
  | { ok: true; id: string; enabled: boolean }
  | { ok: false; status: number; error: string };

/**
 * Apply enable/disable against shared gateway state.
 * Rejects disable when `driven: true` (and builtin / non-toggleable).
 */
export function applyExtensionEnable(
  extension: ScannedExtension,
  enabled: boolean,
  state: ExtensionEnableState,
): ApplyEnableResult {
  if (!enabled && isLockedExtension(extension)) {
    return {
      ok: false,
      status: 403,
      error: extension.driven
        ? `Cannot disable driven extension: ${extension.id}`
        : `Cannot disable ${extension.kind} extension: ${extension.id}`,
    };
  }

  if (isLockedExtension(extension)) {
    // Locked extensions stay enabled; ignore redundant enable=true.
    state.setEnabled(extension.id, true);
  } else {
    state.setEnabled(extension.id, enabled);
  }

  return {
    ok: true,
    id: extension.id,
    enabled: state.isEnabled(extension),
  };
}

/**
 * Shared POST enable handler used by `/api/extensions/:id/enable` and
 * `/api/agent/extensions/:id/enable`.
 */
export async function handleExtensionEnableRequest(
  req: IncomingMessage,
  res: ServerResponse,
  extensionId: string,
  getModel: () => RegistryModel,
  state: ExtensionEnableState,
): Promise<void> {
  const extension = getModel().extensions.find((ext) => ext.id === extensionId);
  if (!extension) {
    sendJson(res, 404, {
      error: `Unknown extension: ${extensionId}`,
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

  const enabled = parseEnabledFlag(body);
  if (enabled === undefined) {
    sendJson(res, 400, { error: 'Body must include boolean "enabled"' });
    return;
  }

  const result = applyExtensionEnable(extension, enabled, state);
  if (!result.ok) {
    sendJson(res, result.status, { error: result.error });
    return;
  }

  sendJson(res, 200, {
    id: result.id,
    enabled: result.enabled,
  });
}

/**
 * Connect middleware: `POST /api/extensions/:id/enable` with `{ enabled: boolean }`.
 * Driven / builtins / non-toggleable extensions cannot be disabled (403).
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

    void handleExtensionEnableRequest(
      req,
      res,
      parsed.extensionId,
      getModel,
      state,
    ).catch((err) => {
      next(err);
    });
  };
}
