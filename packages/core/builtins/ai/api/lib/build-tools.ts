import { tool, type Tool } from 'ai';
import { z } from 'zod';

import type { FetchLike } from './fetch-like';

export type RegistryToolExtension = {
  id: string;
  tools: Array<Record<string, unknown>>;
};

/** Namespaced tool id: `crm__search_contacts`. */
export function toolKey(extensionId: string, toolName: string): string {
  return `${extensionId}__${toolName}`;
}

export function parseToolKey(
  key: string,
): { extensionId: string; toolName: string } | null {
  const idx = key.indexOf('__');
  if (idx <= 0 || idx === key.length - 2) return null;
  return {
    extensionId: key.slice(0, idx),
    toolName: key.slice(idx + 2),
  };
}

function toolMethod(descriptor: Record<string, unknown>): string {
  const method =
    typeof descriptor.method === 'string'
      ? descriptor.method.toUpperCase()
      : 'POST';
  return method || 'POST';
}

function toolName(descriptor: Record<string, unknown>): string | null {
  return typeof descriptor.name === 'string' && descriptor.name.length > 0
    ? descriptor.name
    : null;
}

/**
 * Map enabled registry tools to AI SDK `tool()` entries.
 * `execute` calls the Vite gateway `/api/ext/<id>/tools/<name>`.
 */
export function buildToolsFromRegistry(
  extensions: RegistryToolExtension[],
  gatewayUrl: string,
  fetchImpl: FetchLike = fetch,
): Record<string, Tool> {
  const base = gatewayUrl.replace(/\/+$/, '');
  const tools: Record<string, Tool> = {};

  for (const ext of extensions) {
    for (const descriptor of ext.tools) {
      const name = toolName(descriptor);
      if (!name) continue;
      const key = toolKey(ext.id, name);
      const method = toolMethod(descriptor);
      const description =
        typeof descriptor.description === 'string'
          ? descriptor.description
          : `Extension ${ext.id} tool ${name}`;

      tools[key] = tool({
        description,
        inputSchema: z.record(z.string(), z.unknown()),
        execute: async (input) => {
          const url = `${base}/api/ext/${encodeURIComponent(ext.id)}/tools/${encodeURIComponent(name)}`;
          const init: RequestInit = {
            method,
            headers: { 'content-type': 'application/json' },
          };
          if (method !== 'GET' && method !== 'HEAD') {
            init.body = JSON.stringify(input ?? {});
          }
          const res = await fetchImpl(url, init);
          const text = await res.text();
          let body: unknown = text;
          try {
            body = JSON.parse(text) as unknown;
          } catch {
            // keep raw text
          }
          return {
            ok: res.ok,
            status: res.status,
            body,
          };
        },
      });
    }
  }

  return tools;
}
