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
    expect(resolved.publicDir).toBe('public');
    expect(resolved.auth.allowSignUp).toBe(true);
    expect(resolved.auth.allowPasswordReset).toBe(true);
    expect(resolved.auth.afterSignInPath).toBe('/');
    expect(resolved.branding.appName).toBe('AgentOS');
    expect(resolved.branding.logoUrl).toBeUndefined();
  });

  test('resolveAgentosConfig merges branding overrides', () => {
    const resolved = resolveAgentosConfig({
      publicDir: 'assets',
      branding: {
        appName: 'Acme',
        logoUrl: '/_public/logo.svg',
        faviconUrl: '/_public/favicon.svg',
        fontSans: '/_public/fonts/sans.woff2',
        fontHeading: "'Georgia', serif",
      },
    });
    expect(resolved.publicDir).toBe('assets');
    expect(resolved.branding).toEqual({
      appName: 'Acme',
      logoUrl: '/_public/logo.svg',
      faviconUrl: '/_public/favicon.svg',
      fontSans: '/_public/fonts/sans.woff2',
      fontHeading: "'Georgia', serif",
    });
  });

  test('serializeConfigModule emits runtime subset', () => {
    const source = serializeConfigModule(
      resolveAgentosConfig({
        auth: { allowSignUp: false },
        branding: { appName: 'Acme', logoUrl: '/_public/logo.svg' },
        builtins: { auth: { note: 'x' } },
      }),
    );
    expect(source).toContain('export const config');
    expect(source).toContain('"allowSignUp": false');
    expect(source).toContain('"appName": "Acme"');
    expect(source).toContain('"/_public/logo.svg"');
    expect(source).toContain('"note": "x"');
    expect(source).not.toContain('extensionsDir');
    expect(source).not.toContain('publicDir');
  });
});
