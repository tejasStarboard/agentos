import { describe, expect, test } from 'bun:test';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { scanExtensions } from '@agentos/core/vite/lib/scan-extensions';

const builtinsDir = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

describe('scan builtin hitl', () => {
  test('discovers hitl as driven builtin on port 6114', () => {
    const model = scanExtensions({
      extensionsDir: join(builtinsDir, '__no_customer_extensions__'),
      builtinsDir,
    });

    const hitl = model.extensions.find((e) => e.id === 'hitl');
    expect(hitl).toBeDefined();
    expect(hitl?.kind).toBe('builtin');
    expect(hitl?.driven).toBe(true);
    expect(hitl?.toggleable).toBe(false);
    expect(hitl?.meta.api).toEqual({
      language: 'bun',
      port: 6114,
    });
  });
});
