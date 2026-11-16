import { defineConfig } from '@agentos/core/config';

/**
 * FDE app settings for builtins and the Shell auth gate.
 * Secrets stay in `src/env.ts` / `createEnv`.
 */
export default defineConfig({
  auth: {
    allowSignUp: true,
    allowPasswordReset: true,
    afterSignInPath: '/',
  },
});
