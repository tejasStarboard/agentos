import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { resolveAgentosConfig } from './defaults';
import type { AgentosConfig, ResolvedAgentosConfig } from './types';

export const AGENTOS_CONFIG_FILES = [
  'agentos.config.ts',
  'agentos.config.mts',
  'agentos.config.js',
  'agentos.config.mjs',
] as const;

export type LoadAgentosConfigOptions = {
  /**
   * Force a fresh read (needed when reloading on file watch in dev).
   * Uses an in-memory Bun build so ESM import cache cannot return a stale module.
   * @default false
   */
  bustCache?: boolean;
};

function isAgentosConfig(value: unknown): value is AgentosConfig {
  return value != null && typeof value === 'object' && !Array.isArray(value);
}

/** Absolute path to the first matching `agentos.config.*` under `root`, or null. */
export function findAgentosConfigFile(root: string): string | null {
  for (const name of AGENTOS_CONFIG_FILES) {
    const filePath = join(root, name);
    if (existsSync(filePath)) return filePath;
  }
  return null;
}

/** Identity stub so fresh rebuilds do not pull the whole `@agentos/core` graph. */
const DEFINE_CONFIG_STUB = `
export function defineConfig(config) { return config; }
`;

async function importConfigModule(
  filePath: string,
  bustCache: boolean,
): Promise<unknown> {
  if (!bustCache) {
    const mod = (await import(pathToFileURL(filePath).href)) as {
      default?: unknown;
    };
    return mod.default ?? mod;
  }

  // Fresh evaluate: bundle to memory + Blob URL import (avoids ESM module cache).
  // Cast: installed bun-types omit `write: false` even though runtime supports it.
  const built = await Bun.build({
    entrypoints: [filePath],
    target: 'bun',
    format: 'esm',
    write: false,
    plugins: [
      {
        name: 'agentos-define-config-stub',
        setup(build) {
          build.onResolve({ filter: /^@agentos\/core\/config$/ }, () => ({
            path: 'define-config-stub',
            namespace: 'agentos-stub',
          }));
          build.onLoad(
            { filter: /^define-config-stub$/, namespace: 'agentos-stub' },
            () => ({
              contents: DEFINE_CONFIG_STUB,
              loader: 'js',
            }),
          );
        },
      },
    ],
  } as Parameters<typeof Bun.build>[0]);
  if (!built.success) {
    const message = built.logs.map((l) => l.message).join('\n') || 'unknown';
    throw new Error(`agentos.config: failed to reload ${filePath}: ${message}`);
  }
  const js = await built.outputs[0]!.text();
  // Blob URL (not data:) — Bun evaluates it as a real ESM module.
  const url = URL.createObjectURL(new Blob([js], { type: 'text/javascript' }));
  try {
    const mod = (await import(url)) as { default?: unknown };
    return mod.default ?? mod;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Load and resolve `agentos.config.*` from a Vite / consumer root.
 * Missing file → defaults.
 */
export async function loadAgentosConfig(
  root: string,
  options: LoadAgentosConfigOptions = {},
): Promise<ResolvedAgentosConfig> {
  const filePath = findAgentosConfigFile(root);
  if (!filePath) {
    return resolveAgentosConfig({});
  }
  const raw = await importConfigModule(filePath, options.bustCache === true);
  if (!isAgentosConfig(raw)) {
    throw new Error(
      `agentos.config: expected default export object in ${filePath}`,
    );
  }
  return resolveAgentosConfig(raw);
}
