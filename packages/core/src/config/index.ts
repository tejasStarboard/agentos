/** @agentos/core/config — consumer `agentos.config.ts` helpers. */
export { defineConfig } from './lib/define-config';
export { DEFAULT_AGENTOS_CONFIG, resolveAgentosConfig } from './lib/defaults';
export {
  AGENTOS_CONFIG_FILES,
  findAgentosConfigFile,
  loadAgentosConfig,
} from './lib/load-config';
export type { LoadAgentosConfigOptions } from './lib/load-config';
export { serializeConfigModule } from './lib/serialize-config';
export type {
  AgentosAuthConfig,
  AgentosBrandingConfig,
  AgentosConfig,
  ResolvedAgentosBranding,
  ResolvedAgentosConfig,
} from './lib/types';
