import { describe, expect, test } from 'bun:test';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { scanExtensions } from '@agentos/core/vite/lib/scan-extensions';

const builtinsDir = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

describe('scan builtin cache-store', () => {
  test('discovers cache-store as driven builtin on port 6112', () => {
    const model = scanExtensions({
      extensionsDir: join(builtinsDir, '__no_customer_extensions__'),
      builtinsDir,
    });

    const cacheStore = model.extensions.find((e) => e.id === 'cache-store');
    expect(cacheStore).toBeDefined();
    expect(cacheStore?.kind).toBe('builtin');
    expect(cacheStore?.driven).toBe(true);
    expect(cacheStore?.toggleable).toBe(false);
    expect(cacheStore?.meta.api).toEqual({
      language: 'bun',
      port: 6112,
    });
  });
});
