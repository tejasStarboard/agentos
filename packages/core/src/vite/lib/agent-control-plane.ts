import type { IncomingMessage, ServerResponse } from 'node:http';

import { buildEnabledAgentRegistry } from '@agentos/core/agent/lib/build-enabled-agent-registry';

import type {
  ConnectMiddleware,
  ExtensionEnableState,
} from './extension-enable-state';
import {
  handleExtensionEnableRequest,
  sendJson,
} from './extension-enable-state';
import type { RegistryModel } from './types';

const REGISTRY_PATH = '/api/agent/registry';
const CHAT_PATH = '/api/agent/chat';
const HITL_PATH = '/api/agent/hitl';
const AGENT_ENABLE_PATH_RE = /^\/api\/agent\/extensions\/([^/]+)\/enable\/?$/;

/** Parse `POST /api/agent/extensions/:id/enable` → extension id. */
export function parseAgentExtensionEnablePath(
  pathname: string,
): { extensionId: string } | null {
  const match = AGENT_ENABLE_PATH_RE.exec(pathname);
  if (!match?.[1]) return null;
  try {
    return { extensionId: decodeURIComponent(match[1]) };
  } catch {
    return null;
  }
}

function pathnameOf(req: IncomingMessage): string {
  const url = req.url ?? '';
  return url.split('?')[0] ?? url;
}

function searchOf(req: IncomingMessage): string {
  const url = req.url ?? '';
  const q = url.indexOf('?');
  return q === -1 ? '' : url.slice(q);
}

function methodNotAllowed(res: ServerResponse, allow: string): void {
  res.statusCode = 405;
  res.setHeader('Allow', allow);
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end('Method Not Allowed');
}

/** Stub body pointing HITL at builtin extension APIs (ticket 19). */
function sendDelegateStub(res: ServerResponse, extensionId: 'hitl'): void {
  sendJson(res, 501, {
    error: `Agent ${extensionId} control-plane stub; delegate to builtin`,
    delegate: {
      extensionId,
      pathPrefix: `/api/ext/${extensionId}`,
    },
  });
}

/**
 * Connect middleware for thin agent control-plane routes:
 * - `GET  /api/agent/registry`
 * - `POST /api/agent/extensions/:id/enable`
 * - `POST /api/agent/chat`  → rewrite to `/api/ext/ai/chat` (builtin ai)
 * - `POST /api/agent/hitl`  → stub toward builtin `hitl`
 */
export function createAgentControlPlaneMiddleware(
  getModel: () => RegistryModel,
  state: ExtensionEnableState,
): ConnectMiddleware {
  return (req, res, next) => {
    const pathname = pathnameOf(req);

    if (pathname === REGISTRY_PATH) {
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        methodNotAllowed(res, 'GET, HEAD');
        return;
      }
      const body = buildEnabledAgentRegistry(getModel(), (ext) =>
        state.isEnabled(ext),
      );
      if (req.method === 'HEAD') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end();
        return;
      }
      sendJson(res, 200, body);
      return;
    }

    const enableParsed = parseAgentExtensionEnablePath(pathname);
    if (enableParsed) {
      if (req.method !== 'POST') {
        methodNotAllowed(res, 'POST');
        return;
      }
      void handleExtensionEnableRequest(
        req,
        res,
        enableParsed.extensionId,
        getModel,
        state,
      ).catch((err) => {
        next(err);
      });
      return;
    }

    if (pathname === CHAT_PATH) {
      if (req.method !== 'POST') {
        methodNotAllowed(res, 'POST');
        return;
      }
      // Thin alias: forward to ext-api proxy → builtin ai `/chat`.
      req.url = `/api/ext/ai/chat${searchOf(req)}`;
      next();
      return;
    }

    if (pathname === HITL_PATH) {
      if (req.method !== 'POST') {
        methodNotAllowed(res, 'POST');
        return;
      }
      sendDelegateStub(res, 'hitl');
      return;
    }

    next();
  };
}
