import { describe, expect, test } from 'bun:test';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { scanExtensions } from '@agentos/core/vite/lib/scan-extensions';

const builtinsDir = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

describe('scan builtin db-store', () => {
  test('discovers db-store as driven builtin on port 6111', () => {
    const model = scanExtensions({
      extensionsDir: join(builtinsDir, '__no_customer_extensions__'),
      builtinsDir,
    });

    const dbStore = model.extensions.find((e) => e.id === 'db-store');
    expect(dbStore).toBeDefined();
    expect(dbStore?.kind).toBe('builtin');
    expect(dbStore?.driven).toBe(true);
    expect(dbStore?.toggleable).toBe(false);
    expect(dbStore?.meta.api).toEqual({
      language: 'bun',
      port: 6111,
    });
  });
});
