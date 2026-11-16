import { mock } from 'bun:test';

/**
 * Bun cannot resolve Vite's `virtual:agentos-registry`.
 * Preload a stub so imports of `mountShell` work under `bun test`.
 */
mock.module('virtual:agentos-registry', () => ({
  registry: {
    extensions: [],
    scannedAt: 0,
  },
}));

mock.module('virtual:agentos-config', () => ({
  config: {
    auth: {
      allowSignUp: true,
      allowPasswordReset: true,
      afterSignInPath: '/',
    },
    builtins: {},
  },
}));
