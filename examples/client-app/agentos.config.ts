import { defineConfig } from '@agentos/core/config';

/**
 * FDE app settings for builtins, branding, and the Shell auth gate.
 * Secrets stay in `src/env.ts` / `createEnv`.
 * Static assets in `public/` are served at `/_public/<path>`.
 */
export default defineConfig({
  auth: {
    allowSignUp: true,
    allowPasswordReset: true,
    afterSignInPath: '/',
  },
  branding: {
    appName: 'AgentOS',
    logoUrl: '/_public/logo.svg',
    faviconUrl: '/_public/favicon.svg',
  },
});
