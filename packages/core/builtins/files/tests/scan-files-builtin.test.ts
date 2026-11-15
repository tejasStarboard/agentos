import { describe, expect, test } from 'bun:test';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { scanExtensions } from '@agentos/core/vite/lib/scan-extensions';

const builtinsDir = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

describe('scan builtin files', () => {
  test('discovers files as driven builtin on port 6116', () => {
    const model = scanExtensions({
      extensionsDir: join(builtinsDir, '__no_customer_extensions__'),
      builtinsDir,
    });

    const files = model.extensions.find((e) => e.id === 'files');
    expect(files).toBeDefined();
    expect(files?.kind).toBe('builtin');
    expect(files?.driven).toBe(true);
    expect(files?.toggleable).toBe(false);
    expect(files?.meta.api).toEqual({
      language: 'bun',
      port: 6116,
    });
  });
});
