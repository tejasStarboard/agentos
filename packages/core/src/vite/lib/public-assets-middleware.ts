import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve, sep } from 'node:path';

import type { ConnectMiddleware } from './extension-enable-state';

/** URL prefix for consumer `public/` assets (ticket 44). */
export const PUBLIC_ASSETS_PREFIX = '/_public';

const MIME_BY_EXT: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.otf': 'font/otf',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

/** True when `file` is exactly `root` or a path under it (traversal-safe). */
export function pathUnderRoot(file: string, root: string): boolean {
  const normalizedRoot = root.endsWith(sep) ? root : `${root}${sep}`;
  return file === root || file.startsWith(normalizedRoot);
}

/**
 * Parse `/_public/<relpath>` (pathname only; query ignored).
 * Returns the relative path inside the public root, or null.
 */
export function parsePublicAssetPath(pathname: string): string | null {
  const path = pathname.split('?')[0] ?? pathname;
  if (path === PUBLIC_ASSETS_PREFIX || path === `${PUBLIC_ASSETS_PREFIX}/`) {
    return null;
  }
  const prefix = `${PUBLIC_ASSETS_PREFIX}/`;
  if (!path.startsWith(prefix)) return null;
  const rel = path.slice(prefix.length);
  if (!rel || rel.includes('\0')) return null;
  return rel;
}

function contentTypeFor(filePath: string): string {
  return (
    MIME_BY_EXT[extname(filePath).toLowerCase()] ?? 'application/octet-stream'
  );
}

/**
 * Resolve a public-asset relative path under `publicRoot`.
 * Returns null on traversal or missing file.
 */
export function resolvePublicAssetFile(
  publicRoot: string,
  relativePath: string,
): string | null {
  const root = resolve(publicRoot);
  // Normalize URL segments (reject `..` escape after resolve).
  const candidate = resolve(root, normalize(relativePath));
  if (!pathUnderRoot(candidate, root)) return null;
  if (!existsSync(candidate)) return null;
  try {
    const st = statSync(candidate);
    if (!st.isFile()) return null;
  } catch {
    return null;
  }
  return candidate;
}

/**
 * Serve consumer `public/` files at `/_public/<path>` (dev + preview gateway).
 */
export function createPublicAssetsMiddleware(
  getPublicRoot: () => string,
): ConnectMiddleware {
  return (req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      next();
      return;
    }
    const url = req.url ?? '';
    const pathname = url.split('?')[0] ?? url;
    const relative = parsePublicAssetPath(pathname);
    if (relative == null) {
      next();
      return;
    }

    const filePath = resolvePublicAssetFile(getPublicRoot(), relative);
    if (!filePath) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end(`AgentOS public asset not found: ${pathname}`);
      return;
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', contentTypeFor(filePath));
    if (req.method === 'HEAD') {
      res.end();
      return;
    }
    try {
      res.end(readFileSync(filePath));
    } catch (err) {
      next(err);
    }
  };
}

/** Absolute public root from Vite root + resolved `publicDir`. */
export function resolvePublicRoot(viteRoot: string, publicDir: string): string {
  return join(resolve(viteRoot), publicDir);
}
