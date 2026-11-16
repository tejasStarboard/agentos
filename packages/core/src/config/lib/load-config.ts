import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { resolveAgentosConfig } from './defaults';
import type { AgentosConfig, ResolvedAgentosConfig } from './types';

const CONFIG_FILES = [
  'agentos.config.ts',
  'agentos.config.mts',
  'agentos.config.js',
  'agentos.config.mjs',
] as const;

function isAgentosConfig(value: unknown): value is AgentosConfig {
  return value != null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Load and resolve `agentos.config.*` from a Vite / consumer root.
 * Missing file → defaults.
 */
export async function loadAgentosConfig(
  root: string,
): Promise<ResolvedAgentosConfig> {
  for (const name of CONFIG_FILES) {
    const filePath = join(root, name);
    if (!existsSync(filePath)) continue;
    const mod = (await import(pathToFileURL(filePath).href)) as {
      default?: unknown;
    };
    const raw = mod.default ?? mod;
    if (!isAgentosConfig(raw)) {
      throw new Error(
        `agentos.config: expected default export object in ${filePath}`,
      );
    }
    return resolveAgentosConfig(raw);
  }
  return resolveAgentosConfig({});
}
