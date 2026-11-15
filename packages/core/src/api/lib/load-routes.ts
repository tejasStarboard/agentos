import { readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';

import { folderPathToPattern } from './match-route';
import type { App, HttpMethod, RouteModule } from './types';

const HTTP_METHODS: HttpMethod[] = [
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'OPTIONS',
  'HEAD',
];

/**
 * Scan `routesDir` for nested `index.ts` modules, map folders to URL patterns
 * (`[param]` → `:param`), and register handlers on `app`.
 */
export async function loadRoutes(app: App, routesDir: string): Promise<void> {
  const indexFiles = await findIndexFiles(routesDir);

  for (const filePath of indexFiles) {
    const rel = relative(routesDir, filePath).replace(/\\/g, '/');
    // tools/search_contacts/index.ts → folder tools/search_contacts
    // root index.ts → empty → pattern /
    const folder = rel
      .replace(/(^|\/)index\.(tsx?|js)$/, '')
      .replace(/\/$/, '');
    const pattern = folderPathToPattern(folder);

    const mod = (await import(pathToFileURL(filePath).href)) as RouteModule;
    const middleware = Array.isArray(mod.middleware) ? mod.middleware : [];

    for (const method of HTTP_METHODS) {
      const handler = mod[method];
      if (typeof handler === 'function') {
        app.route(method, pattern, handler, middleware);
      }
    }
  }
}

async function findIndexFiles(dir: string): Promise<string[]> {
  const results: string[] = [];

  async function walk(current: string): Promise<void> {
    let entries;
    try {
      entries = await readdir(current, { withFileTypes: true });
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if (code === 'ENOENT') {
        return;
      }
      throw err;
    }

    for (const entry of entries) {
      const full = join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
        continue;
      }
      if (
        entry.isFile() &&
        (entry.name === 'index.ts' ||
          entry.name === 'index.tsx' ||
          entry.name === 'index.js')
      ) {
        results.push(full);
      }
    }
  }

  await walk(dir);
  return results.sort();
}
