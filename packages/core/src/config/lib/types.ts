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
 * App branding for Shell chrome (ticket 44).
 * Logo/favicon/font URLs must be `/_public/...` or absolute `https://` — never filesystem paths.
 * Secrets stay in `src/env.ts` / `createEnv` — not here.
 */
export type AgentosBrandingConfig = {
  /** Product name shown in auth chrome / document title. @default 'AgentOS' */
  appName?: string;
  /** Browser URL for logo (`/_public/logo.svg` or https). */
  logoUrl?: string;
  /** Browser URL for favicon. */
  faviconUrl?: string;
  /**
   * CSS font-family stack, or a `/_public|https` font file URL.
   * URL values inject `@font-face` and set `--font-sans`.
   */
  fontSans?: string;
  /**
   * CSS font-family stack, or a `/_public|https` font file URL.
   * URL values inject `@font-face` and set `--font-heading`.
   */
  fontHeading?: string;
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
  /**
   * Consumer folder served at `/_public/<path>` (Vite gateway).
   * Build-time only — not emitted to `virtual:agentos-config`.
   * @default 'public'
   */
  publicDir?: string;
  /** Public auth gate + route flags. */
  auth?: AgentosAuthConfig;
  /** App name, logo, favicon, typography for Shell chrome. */
  branding?: AgentosBrandingConfig;
  /**
   * Reserved for FDE knobs per builtin id.
   * Auth UI flags live under {@link AgentosConfig.auth}.
   */
  builtins?: Record<string, Record<string, unknown>>;
};

/** Resolved branding with defaults applied. */
export type ResolvedAgentosBranding = {
  appName: string;
  logoUrl?: string;
  faviconUrl?: string;
  fontSans?: string;
  fontHeading?: string;
};

/** Resolved config with defaults applied (runtime + Vite). */
export type ResolvedAgentosConfig = {
  extensionsDir: string;
  builtinsDir?: string;
  publicDir: string;
  auth: {
    allowSignUp: boolean;
    allowPasswordReset: boolean;
    afterSignInPath: string;
  };
  branding: ResolvedAgentosBranding;
  builtins: Record<string, Record<string, unknown>>;
};
