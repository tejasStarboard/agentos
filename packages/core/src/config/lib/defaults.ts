import type { AgentosConfig, ResolvedAgentosConfig } from './types';

export const DEFAULT_AGENTOS_CONFIG: ResolvedAgentosConfig = {
  extensionsDir: 'extensions',
  publicDir: 'public',
  auth: {
    allowSignUp: true,
    allowPasswordReset: true,
    afterSignInPath: '/',
  },
  branding: {
    appName: 'AgentOS',
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
    publicDir: raw.publicDir ?? DEFAULT_AGENTOS_CONFIG.publicDir,
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
    branding: {
      appName: raw.branding?.appName ?? DEFAULT_AGENTOS_CONFIG.branding.appName,
      logoUrl: raw.branding?.logoUrl,
      faviconUrl: raw.branding?.faviconUrl,
      fontSans: raw.branding?.fontSans,
      fontHeading: raw.branding?.fontHeading,
    },
    builtins: { ...(raw.builtins ?? {}) },
  };
}
