import type { AgentosConfig, ResolvedAgentosConfig } from './types';

export const DEFAULT_AGENTOS_CONFIG: ResolvedAgentosConfig = {
  extensionsDir: 'extensions',
  auth: {
    allowSignUp: true,
    allowPasswordReset: true,
    afterSignInPath: '/',
  },
  builtins: {},
};

/** Merge partial consumer config onto defaults. */
export function resolveAgentosConfig(
  input: AgentosConfig | undefined | null = {},
): ResolvedAgentosConfig {
  const raw = input ?? {};
  return {
    extensionsDir: raw.extensionsDir ?? DEFAULT_AGENTOS_CONFIG.extensionsDir,
    builtinsDir: raw.builtinsDir,
    auth: {
      allowSignUp:
        raw.auth?.allowSignUp ?? DEFAULT_AGENTOS_CONFIG.auth.allowSignUp,
      allowPasswordReset:
        raw.auth?.allowPasswordReset ??
        DEFAULT_AGENTOS_CONFIG.auth.allowPasswordReset,
      afterSignInPath:
        raw.auth?.afterSignInPath ??
        DEFAULT_AGENTOS_CONFIG.auth.afterSignInPath,
    },
    builtins: { ...(raw.builtins ?? {}) },
  };
}
