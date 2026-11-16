import { afterEach, describe, expect, test } from 'bun:test';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  defineConfig,
  findAgentosConfigFile,
  loadAgentosConfig,
  resolveAgentosConfig,
  serializeConfigModule,
} from '@agentos/core/config';

describe('agentos config', () => {
  const temps: string[] = [];

  afterEach(() => {
    for (const dir of temps.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

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

  test('findAgentosConfigFile locates agentos.config.ts', () => {
    const root = mkdtempSync(join(tmpdir(), 'agentos-find-config-'));
    temps.push(root);
    expect(findAgentosConfigFile(root)).toBeNull();
    const file = join(root, 'agentos.config.ts');
    writeFileSync(file, 'export default {};\n');
    expect(findAgentosConfigFile(root)).toBe(file);
  });

  test('loadAgentosConfig bustCache re-reads branding changes', async () => {
    const root = mkdtempSync(join(tmpdir(), 'agentos-load-bust-'));
    temps.push(root);
    const file = join(root, 'agentos.config.ts');
    writeFileSync(file, `export default { branding: { appName: 'One' } };\n`);
    const first = await loadAgentosConfig(root);
    expect(first.branding.appName).toBe('One');

    writeFileSync(file, `export default { branding: { appName: 'Two' } };\n`);
    const stale = await loadAgentosConfig(root);
    expect(stale.branding.appName).toBe('One');

    const fresh = await loadAgentosConfig(root, { bustCache: true });
    expect(fresh.branding.appName).toBe('Two');
  });
});
