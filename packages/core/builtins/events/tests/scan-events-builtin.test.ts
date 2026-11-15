import { describe, expect, test } from 'bun:test';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { scanExtensions } from '@agentos/core/vite/lib/scan-extensions';

const builtinsDir = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

describe('scan builtin events', () => {
  test('discovers events as driven builtin on port 6115', () => {
    const model = scanExtensions({
      extensionsDir: join(builtinsDir, '__no_customer_extensions__'),
      builtinsDir,
    });

    const events = model.extensions.find((e) => e.id === 'events');
    expect(events).toBeDefined();
    expect(events?.kind).toBe('builtin');
    expect(events?.driven).toBe(true);
    expect(events?.toggleable).toBe(false);
    expect(events?.meta.api).toEqual({
      language: 'bun',
      port: 6115,
    });
  });
});
