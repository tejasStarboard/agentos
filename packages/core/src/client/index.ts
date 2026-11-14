/**
 * `@agentos/core/client` — React SDK for extension **UI** (`ui/*.tsx` only).
 *
 * Do **not** import this from `api/routes/**`, Python services, or the shell host.
 * Use `@agentos/core/api/*` in Bun API routes instead.
 *
 * Hides Comlink / MessageChannel details behind HostProvider + useHost* hooks.
 */
export * from './lib/index';
