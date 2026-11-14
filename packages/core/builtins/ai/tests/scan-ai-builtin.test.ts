import { describe, expect, test } from 'bun:test';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { scanExtensions } from '@agentos/core/vite/lib/scan-extensions';

const builtinsDir = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

describe('scan builtin ai', () => {
  test('discovers ai as driven builtin on port 6113', () => {
    const model = scanExtensions({
      extensionsDir: join(builtinsDir, '__no_customer_extensions__'),
      builtinsDir,
    });

    const ai = model.extensions.find((e) => e.id === 'ai');
    expect(ai).toBeDefined();
    expect(ai?.kind).toBe('builtin');
    expect(ai?.driven).toBe(true);
    expect(ai?.toggleable).toBe(false);
    expect(ai?.meta.api).toEqual({
      language: 'bun',
      port: 6113,
    });
  });
});
