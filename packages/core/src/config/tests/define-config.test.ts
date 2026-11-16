import { describe, expect, test } from 'bun:test';

import {
  defineConfig,
  resolveAgentosConfig,
  serializeConfigModule,
} from '@agentos/core/config';

describe('agentos config', () => {
  test('defineConfig returns the same object', () => {
    const cfg = defineConfig({
      auth: { allowSignUp: false, afterSignInPath: '/home' },
    });
    expect(cfg.auth?.allowSignUp).toBe(false);
    expect(cfg.auth?.afterSignInPath).toBe('/home');
  });

  test('resolveAgentosConfig applies defaults', () => {
    const resolved = resolveAgentosConfig({});
    expect(resolved.extensionsDir).toBe('extensions');
    expect(resolved.auth.allowSignUp).toBe(true);
    expect(resolved.auth.allowPasswordReset).toBe(true);
    expect(resolved.auth.afterSignInPath).toBe('/');
  });

  test('serializeConfigModule emits runtime subset', () => {
    const source = serializeConfigModule(
      resolveAgentosConfig({
        auth: { allowSignUp: false },
        builtins: { auth: { note: 'x' } },
      }),
    );
    expect(source).toContain('export const config');
    expect(source).toContain('"allowSignUp": false');
    expect(source).toContain('"note": "x"');
    expect(source).not.toContain('extensionsDir');
  });
});
