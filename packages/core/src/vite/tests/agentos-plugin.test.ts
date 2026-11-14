import { afterEach, describe, expect, test } from 'bun:test';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  agentos,
  RESOLVED_VIRTUAL_REGISTRY_ID,
  VIRTUAL_REGISTRY_ID,
} from '../lib/agentos-plugin';
import type { Plugin, ViteDevServer } from 'vite';

const fixturesRoot = fileURLToPath(new URL('./fixtures', import.meta.url));
const extensionsDir = join(fixturesRoot, 'extensions');
const builtinsDir = join(fixturesRoot, 'builtins');

type PluginHooks = Plugin & {
  configResolved?: (config: { root: string }) => void | Promise<void>;
  resolveId?: (id: string) => string | undefined | null;
  load?: (
    id: string,
  ) => string | undefined | null | Promise<string | undefined | null>;
  configureServer?: (server: ViteDevServer) => void | Promise<void>;
};

function asHooks(plugin: Plugin): PluginHooks {
  return plugin as PluginHooks;
}

describe('agentos()', () => {
  const temps: string[] = [];

  afterEach(() => {
    for (const dir of temps.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test('exports a named vite plugin', () => {
    const plugin = agentos({ extensionsDir, builtinsDir });
    expect(plugin.name).toBe('agentos');
  });

  test('resolves and loads virtual:agentos-registry', async () => {
    const plugin = asHooks(agentos({ extensionsDir, builtinsDir }));
    await plugin.configResolved?.({ root: fixturesRoot });

    expect(plugin.resolveId?.(VIRTUAL_REGISTRY_ID)).toBe(
      RESOLVED_VIRTUAL_REGISTRY_ID,
    );

    const source = await plugin.load?.(RESOLVED_VIRTUAL_REGISTRY_ID);
    expect(typeof source).toBe('string');
    expect(source).toContain('export const registry');
    expect(source).toContain('"id": "crm"');
    expect(source).toContain('"id": "auth"');
    expect(source).toContain('"kind": "builtin"');
    expect(source).toContain('"driven": true');
    expect(source).toContain('"toggleable": true');
    expect(source).toContain('/__agentos/ext/crm/page.html');
    expect(source).toContain('import { skills as __agentos_skills_crm }');
    expect(source).toMatch(/"skills":\s*__agentos_skills_crm/);
  });

  test('rescans and invalidates registry on watched file changes', async () => {
    const root = mkdtempSync(join(tmpdir(), 'agentos-plugin-'));
    temps.push(root);
    const extDir = join(root, 'extensions');
    const builtinDir = join(root, 'builtins');
    mkdirSync(extDir, { recursive: true });
    mkdirSync(builtinDir, { recursive: true });

    const plugin = asHooks(
      agentos({
        extensionsDir: extDir,
        builtinsDir: builtinDir,
      }),
    );
    await plugin.configResolved?.({ root });

    const before = await plugin.load?.(RESOLVED_VIRTUAL_REGISTRY_ID);
    expect(before).toContain('"extensions": []');

    const invalidated: string[] = [];
    const reloads: unknown[] = [];
    const handlers: Record<string, Array<(file: string) => void>> = {};

    const fakeServer = {
      moduleGraph: {
        getModuleById(id: string) {
          return id === RESOLVED_VIRTUAL_REGISTRY_ID
            ? { id: RESOLVED_VIRTUAL_REGISTRY_ID }
            : undefined;
        },
        invalidateModule(mod: { id: string }) {
          invalidated.push(mod.id);
        },
      },
      watcher: {
        add() {},
        on(event: string, cb: (file: string) => void) {
          (handlers[event] ??= []).push(cb);
        },
      },
      ws: {
        send(payload: unknown) {
          reloads.push(payload);
        },
      },
    } as unknown as ViteDevServer;

    await plugin.configureServer?.(fakeServer);

    const newExt = join(extDir, 'demo');
    mkdirSync(join(newExt, 'ui'), { recursive: true });
    writeFileSync(
      join(newExt, 'meta.json'),
      JSON.stringify({ name: 'Demo' }),
      'utf8',
    );
    writeFileSync(join(newExt, 'ui/page.tsx'), 'export default () => null;\n');

    for (const cb of handlers.add ?? []) {
      cb(join(newExt, 'meta.json'));
    }

    expect(invalidated).toContain(RESOLVED_VIRTUAL_REGISTRY_ID);
    expect(
      reloads.some((p) => (p as { type?: string }).type === 'full-reload'),
    ).toBe(true);

    const after = await plugin.load?.(RESOLVED_VIRTUAL_REGISTRY_ID);
    expect(after).toContain('"id": "demo"');
    expect(after).toContain('"name": "Demo"');
  });
});
