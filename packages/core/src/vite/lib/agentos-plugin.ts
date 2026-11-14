import { existsSync, mkdirSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { IncomingMessage, ServerResponse } from 'node:http';

import type { Plugin, ViteDevServer } from 'vite';

import { serializeExtEntryModule } from './ext-entry-module';
import {
  parseExtHtmlPath,
  parseVirtualExtEntryId,
  renderExtHtmlEntry,
  resolvedVirtualExtEntryId,
  virtualExtEntryId,
  virtualExtEntryScriptSrc,
} from './html-entry';
import { scanExtensions } from './scan-extensions';
import { serializeRegistryModule } from './serialize-registry';
import type {
  AgentosPluginOptions,
  RegistryModel,
  ScannedExtension,
  UiViewName,
} from './types';

/** Public virtual module id imported by the Shell (ticket 11). */
export const VIRTUAL_REGISTRY_ID = 'virtual:agentos-registry';

/** Resolved id with Vite's `\0` virtual prefix. */
export const RESOLVED_VIRTUAL_REGISTRY_ID = `\0${VIRTUAL_REGISTRY_ID}`;

export {
  EXT_HTML_PREFIX,
  VIRTUAL_EXT_ENTRY_PREFIX,
  parseExtHtmlPath,
  parseVirtualExtEntryId,
  renderExtHtmlEntry,
  resolvedVirtualExtEntryId,
  virtualExtEntryId,
  virtualExtEntryScriptSrc,
} from './html-entry';

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

function findExtension(
  model: RegistryModel,
  extensionId: string,
): ScannedExtension | undefined {
  return model.extensions.find((ext) => ext.id === extensionId);
}

function viewFilePath(
  model: RegistryModel,
  extensionId: string,
  view: UiViewName,
): string | undefined {
  return findExtension(model, extensionId)?.ui[view];
}

type ConnectMiddleware = (
  req: IncomingMessage,
  res: ServerResponse,
  next: (err?: unknown) => void,
) => void;

function createExtHtmlMiddleware(
  getModel: () => RegistryModel,
  scriptSrcFor: (extensionId: string, view: UiViewName) => string,
): ConnectMiddleware {
  return (req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      next();
      return;
    }
    const url = req.url ?? '';
    const pathname = url.split('?')[0] ?? url;
    const parsed = parseExtHtmlPath(pathname);
    if (!parsed) {
      next();
      return;
    }
    const filePath = viewFilePath(getModel(), parsed.extensionId, parsed.view);
    if (!filePath) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end(
        `AgentOS extension view not found: ${parsed.extensionId}/${parsed.view}`,
      );
      return;
    }
    const html = renderExtHtmlEntry({
      extensionId: parsed.extensionId,
      view: parsed.view,
      scriptSrc: scriptSrcFor(parsed.extensionId, parsed.view),
    });
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    if (req.method === 'HEAD') {
      res.end();
      return;
    }
    res.end(html);
  };
}

/**
 * Vite plugin: scan `extensions/` + `builtins/`, expose `virtual:agentos-registry`,
 * serve `/__agentos/ext/<id>/<view>.html` iframe entries, and invalidate on FS changes.
 */
export function agentos(options: AgentosPluginOptions = {}): Plugin {
  let viteRoot = process.cwd();
  let extensionsDir = '';
  let builtinsDir = '';
  let model: RegistryModel = { extensions: [], scannedAt: 0 };
  let server: ViteDevServer | undefined;
  /** Rollup entry name → `{ extensionId, view }` for generateBundle HTML emit. */
  const buildEntryNames = new Map<
    string,
    { extensionId: string; view: UiViewName }
  >();

  const rescan = (): RegistryModel => {
    model = scanExtensions({ extensionsDir, builtinsDir });
    return model;
  };

  const eachUiView = (
    fn: (ext: ScannedExtension, view: UiViewName, filePath: string) => void,
  ): void => {
    for (const ext of model.extensions) {
      for (const view of ['page', 'sidebar', 'widget'] as const) {
        const filePath = ext.ui[view];
        if (filePath) fn(ext, view, filePath);
      }
    }
  };

  const invalidateRegistry = (): void => {
    if (!server) return;
    const mod = server.moduleGraph.getModuleById(RESOLVED_VIRTUAL_REGISTRY_ID);
    if (mod) {
      server.moduleGraph.invalidateModule(mod);
    }
    eachUiView((ext, view) => {
      const id = resolvedVirtualExtEntryId(ext.id, view);
      const entryMod = server!.moduleGraph.getModuleById(id);
      if (entryMod) {
        server!.moduleGraph.invalidateModule(entryMod);
      }
    });
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
      buildEntryNames.clear();
      eachUiView((ext, view) => {
        const name = `__agentos/ext/${ext.id}/${view}`;
        buildEntryNames.set(name, { extensionId: ext.id, view });
      });
    },

    options(rollupOptions) {
      rescan();
      const extraInput: Record<string, string> = {};
      eachUiView((ext, view) => {
        const name = `__agentos/ext/${ext.id}/${view}`;
        extraInput[name] = virtualExtEntryId(ext.id, view);
        buildEntryNames.set(name, { extensionId: ext.id, view });
      });
      if (Object.keys(extraInput).length === 0) {
        return null;
      }
      const prev = rollupOptions.input;
      let input: Record<string, string> | string[] | string;
      if (prev == null) {
        input = extraInput;
      } else if (typeof prev === 'string') {
        input = { main: prev, ...extraInput };
      } else if (Array.isArray(prev)) {
        input = [...prev, ...Object.values(extraInput)];
      } else {
        input = { ...prev, ...extraInput };
      }
      return { ...rollupOptions, input };
    },

    resolveId(id) {
      if (id === VIRTUAL_REGISTRY_ID) {
        return RESOLVED_VIRTUAL_REGISTRY_ID;
      }
      const parsed = parseVirtualExtEntryId(id);
      if (parsed) {
        return resolvedVirtualExtEntryId(parsed.extensionId, parsed.view);
      }
      return undefined;
    },

    load(id) {
      if (id === RESOLVED_VIRTUAL_REGISTRY_ID) {
        return serializeRegistryModule(model);
      }
      const parsed = parseVirtualExtEntryId(id);
      if (!parsed) return undefined;
      const filePath = viewFilePath(model, parsed.extensionId, parsed.view);
      if (!filePath) {
        return `throw new Error(${JSON.stringify(
          `AgentOS extension view not found: ${parsed.extensionId}/${parsed.view}`,
        )});`;
      }
      return serializeExtEntryModule(filePath);
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

      devServer.middlewares.use(
        createExtHtmlMiddleware(
          () => model,
          (extensionId, view) => virtualExtEntryScriptSrc(extensionId, view),
        ),
      );
    },

    configurePreviewServer(previewServer) {
      // Post-hook: prefer `generateBundle` HTML assets from dist; fall back here.
      return () => {
        previewServer.middlewares.use(
          createExtHtmlMiddleware(
            () => model,
            (extensionId, view) => virtualExtEntryScriptSrc(extensionId, view),
          ),
        );
      };
    },

    generateBundle(_options, bundle) {
      for (const [fileName, output] of Object.entries(bundle)) {
        if (output.type !== 'chunk' || !output.isEntry) continue;
        const meta = buildEntryNames.get(output.name);
        if (!meta) continue;
        const scriptSrc = `/${fileName}`;
        this.emitFile({
          type: 'asset',
          fileName: `__agentos/ext/${meta.extensionId}/${meta.view}.html`,
          source: renderExtHtmlEntry({
            extensionId: meta.extensionId,
            view: meta.view,
            scriptSrc,
          }),
        });
      }
    },
  };
}
