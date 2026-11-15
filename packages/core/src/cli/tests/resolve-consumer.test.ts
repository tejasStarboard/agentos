import { describe, expect, test } from 'bun:test';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  isConsumerRoot,
  readPackageName,
  resolveConsumerRoot,
  resolveExtensionsDir,
} from '../lib/resolve-consumer';

const clientApp = fileURLToPath(
  new URL('../../../../../examples/client-app', import.meta.url),
);

describe('resolveConsumerRoot', () => {
  test('accepts examples/client-app', () => {
    expect(isConsumerRoot(clientApp)).toBe(true);
    expect(resolveConsumerRoot(clientApp)).toBe(clientApp);
  });

  test('rejects empty temp dir', () => {
    const dir = mkdtempSync(join(tmpdir(), 'agentos-cli-'));
    try {
      expect(isConsumerRoot(dir)).toBe(false);
      expect(() => resolveConsumerRoot(dir)).toThrow(/not a consumer app root/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test('accepts vite.config.ts without extensions', () => {
    const dir = mkdtempSync(join(tmpdir(), 'agentos-cli-'));
    try {
      writeFileSync(join(dir, 'vite.config.ts'), 'export default {}');
      expect(isConsumerRoot(dir)).toBe(true);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe('resolveExtensionsDir', () => {
  test('defaults to consumer/extensions', () => {
    expect(resolveExtensionsDir(clientApp)).toBe(join(clientApp, 'extensions'));
  });
});

describe('readPackageName', () => {
  test('reads @agentos/client-app', () => {
    expect(readPackageName(clientApp)).toBe('@agentos/client-app');
  });

  test('returns null without package.json', () => {
    const dir = mkdtempSync(join(tmpdir(), 'agentos-cli-'));
    try {
      mkdirSync(join(dir, 'extensions'));
      expect(readPackageName(dir)).toBeNull();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
