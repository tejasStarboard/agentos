/**
 * @agentos/core/api/tools — call extension HTTP tools via the gateway.
 * Tools live on extension APIs: POST /api/ext/{extensionId}/tools/{toolName}.
 */

import { postJson, resolveGatewayUrl, type EnvMap } from './http';

/** Resolve tool invocation URL for an extension tool. */
export function resolveToolUrl(
  extensionId: string,
  toolName: string,
  env: EnvMap = Bun.env,
): string {
  const gateway = resolveGatewayUrl(env);
  return `${gateway}/api/ext/${encodeURIComponent(extensionId)}/tools/${encodeURIComponent(toolName)}`;
}

/**
 * Invoke an extension tool (JSON body → JSON response).
 * Throws on non-OK (same as other API kit clients).
 */
export async function callTool<T = unknown>(
  extensionId: string,
  toolName: string,
  body: unknown = {},
  env?: EnvMap,
): Promise<T> {
  const url = resolveToolUrl(extensionId, toolName, env ?? Bun.env);
  return postJson<T>(url, body ?? {}, `tools ${extensionId}/${toolName}`);
}
