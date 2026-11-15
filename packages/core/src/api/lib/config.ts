/**
 * @agentos/core/api/config — thin env/config helpers for Bun API routes.
 * Uses the same AGENT_OS_GLOBAL_* / AGENT_OS_EXT_* naming as @agentos/core/api/env.
 */

import {
  assertExtKey,
  assertGlobalKey,
  extDomain,
  extKeyPrefix,
  GLOBAL_PREFIX,
  platformKeys,
} from './env';
import { resolveGatewayUrl, type EnvMap } from './http';

export {
  GLOBAL_PREFIX,
  assertExtKey,
  assertGlobalKey,
  extDomain,
  extKeyPrefix,
  platformKeys,
};

/** Gateway origin used by API kit clients. */
export function getGatewayUrl(env: EnvMap = Bun.env): string {
  return resolveGatewayUrl(env);
}

/**
 * Collect `AGENT_OS_EXT_<DOMAIN>_*` keys for an extension id into a plain map
 * (suffix → value). Does not invent a second env system.
 */
export function getExtConfig(
  extensionId: string,
  env: EnvMap = Bun.env,
): Record<string, string> {
  const prefix = extKeyPrefix(extensionId);
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    if (value === undefined) continue;
    if (!key.startsWith(prefix)) continue;
    out[key.slice(prefix.length)] = value;
  }
  return out;
}

/** Read a single extension env key (full name or suffix under the domain prefix). */
export function getExtEnv(
  extensionId: string,
  keyOrSuffix: string,
  env: EnvMap = Bun.env,
): string | undefined {
  if (keyOrSuffix.startsWith('AGENT_OS_')) {
    assertExtKey(keyOrSuffix, extensionId);
    return env[keyOrSuffix];
  }
  return env[`${extKeyPrefix(extensionId)}${keyOrSuffix}`];
}
