import { describe, expect, test } from 'bun:test';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { scanExtensions } from '@agentos/core/vite/lib/scan-extensions';

const builtinsDir = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

describe('scan builtin audit', () => {
  test('discovers audit as driven builtin on port 6119', () => {
    const model = scanExtensions({
      extensionsDir: join(builtinsDir, '__no_customer_extensions__'),
      builtinsDir,
    });

    const audit = model.extensions.find((e) => e.id === 'audit');
    expect(audit).toBeDefined();
    expect(audit?.kind).toBe('builtin');
    expect(audit?.driven).toBe(true);
    expect(audit?.toggleable).toBe(false);
    expect(audit?.meta.api).toEqual({
      language: 'bun',
      port: 6119,
    });
  });
});
