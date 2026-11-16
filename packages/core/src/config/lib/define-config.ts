import type { AgentosConfig } from './types';

/**
 * Type helper for consumer-root `agentos.config.ts`.
 *
 * @example
 * ```ts
 * import { defineConfig } from '@agentos/core/config';
 * export default defineConfig({
 *   auth: { allowSignUp: true, afterSignInPath: '/' },
 * });
 * ```
 */
export function defineConfig(config: AgentosConfig): AgentosConfig {
  return config;
}
