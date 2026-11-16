import type { ResolvedAgentosConfig } from './types';

/**
 * Emit the virtual module source for `virtual:agentos-config`.
 * Runtime subset only (safe for browser import).
 */
export function serializeConfigModule(config: ResolvedAgentosConfig): string {
  const runtime = {
    auth: config.auth,
    builtins: config.builtins,
  };
  // Plain JS — Vite/Rollup load virtual modules as JavaScript (no TS syntax).
  return `export const config = ${JSON.stringify(runtime, null, 2)};\n`;
}
