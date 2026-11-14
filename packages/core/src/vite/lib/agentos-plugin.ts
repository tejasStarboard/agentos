import { existsSync, mkdirSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { Plugin, ViteDevServer } from 'vite';

import { scanExtensions } from './scan-extensions';
import { serializeRegistryModule } from './serialize-registry';
import type { AgentosPluginOptions, RegistryModel } from './types';

/** Public virtual module id imported by the Shell (ticket 11). */
export const VIRTUAL_REGISTRY_ID = 'virtual:agentos-registry';

/** Resolved id with Vite's `\0` virtual prefix. */
export const RESOLVED_VIRTUAL_REGISTRY_ID = `\0${VIRTUAL_REGISTRY_ID}`;

/** Absolute path to the `@agentos/core` package root. */
export function resolveCorePackageRoot(): string {
  // packages/core/src/vite/lib → packages/core
  return resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
}

function defaultBuiltinsDir(): string {
  return join(resolveCorePackageRoot(), 'builtins');
}

function ensureDir(path: string): void {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
  }
}

function pathUnderRoot(file: string, root: string): boolean {
  const normalizedRoot = root.endsWith('/') ? root : `${root}/`;
  return file === root || file.startsWith(normalizedRoot);
}

/**
 * Vite plugin: scan `extensions/` + `builtins/`, expose `virtual:agentos-registry`,
 * and invalidate the registry on filesystem changes.
 */
export function agentos(options: AgentosPluginOptions = {}): Plugin {
  let viteRoot = process.cwd();
  let extensionsDir = '';
  let builtinsDir = '';
  let model: RegistryModel = { extensions: [], scannedAt: 0 };
  let server: ViteDevServer | undefined;

  const rescan = (): RegistryModel => {
    model = scanExtensions({ extensionsDir, builtinsDir });
    return model;
  };

  const invalidateRegistry = (): void => {
    if (!server) return;
    const mod = server.moduleGraph.getModuleById(RESOLVED_VIRTUAL_REGISTRY_ID);
    if (mod) {
      server.moduleGraph.invalidateModule(mod);
    }
    server.ws.send({
      type: 'full-reload',
      path: '*',
    });
  };

  return {
    name: 'agentos',

    configResolved(config) {
      viteRoot = config.root;
      const extensionsOption = options.extensionsDir ?? 'extensions';
      extensionsDir = isAbsolute(extensionsOption)
        ? extensionsOption
        : resolve(viteRoot, extensionsOption);
      builtinsDir = options.builtinsDir
        ? resolve(options.builtinsDir)
        : defaultBuiltinsDir();

      ensureDir(extensionsDir);
      ensureDir(builtinsDir);
      rescan();
    },

    buildStart() {
      rescan();
    },

    resolveId(id) {
      if (id === VIRTUAL_REGISTRY_ID) {
        return RESOLVED_VIRTUAL_REGISTRY_ID;
      }
      return undefined;
    },

    load(id) {
      if (id === RESOLVED_VIRTUAL_REGISTRY_ID) {
        return serializeRegistryModule(model);
      }
      return undefined;
    },

    configureServer(devServer) {
      server = devServer;
      ensureDir(extensionsDir);
      ensureDir(builtinsDir);
      devServer.watcher.add(extensionsDir);
      devServer.watcher.add(builtinsDir);

      const onFsChange = (file: string): void => {
        if (
          !pathUnderRoot(file, extensionsDir) &&
          !pathUnderRoot(file, builtinsDir)
        ) {
          return;
        }
        rescan();
        invalidateRegistry();
      };

      devServer.watcher.on('add', onFsChange);
      devServer.watcher.on('unlink', onFsChange);
      devServer.watcher.on('addDir', onFsChange);
      devServer.watcher.on('unlinkDir', onFsChange);
      // meta.json / agent file edits should also refresh the model
      devServer.watcher.on('change', onFsChange);
    },
  };
}
