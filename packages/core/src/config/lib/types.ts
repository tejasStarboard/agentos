/** Auth surface flags for the Shell gate (ticket 43). */
export type AgentosAuthConfig = {
  /** When false, `/register` is hidden/blocked. @default true */
  allowSignUp?: boolean;
  /** When false, forgot/reset password routes are hidden/blocked. @default true */
  allowPasswordReset?: boolean;
  /** Path after successful sign-in / sign-up. @default '/' */
  afterSignInPath?: string;
};

/**
 * Consumer-root `agentos.config.ts` shape.
 * Secrets stay in `src/env.ts` / `createEnv` — not here.
 */
export type AgentosConfig = {
  /**
   * Customer extensions directory, relative to Vite root.
   * @default 'extensions'
   */
  extensionsDir?: string;
  /**
   * Absolute path to builtins (advanced). Defaults to `@agentos/core` builtins.
   */
  builtinsDir?: string;
  /** Public auth gate + route flags. */
  auth?: AgentosAuthConfig;
  /**
   * Reserved for FDE knobs per builtin id.
   * Auth UI flags live under {@link AgentosConfig.auth}.
   */
  builtins?: Record<string, Record<string, unknown>>;
};

/** Resolved config with defaults applied (runtime + Vite). */
export type ResolvedAgentosConfig = {
  extensionsDir: string;
  builtinsDir?: string;
  auth: {
    allowSignUp: boolean;
    allowPasswordReset: boolean;
    afterSignInPath: string;
  };
  builtins: Record<string, Record<string, unknown>>;
};
