import { describe, expect, test } from 'bun:test';

import { prefixLine, pipePrefixed } from '../lib/prefix-logs';

describe('prefixLine', () => {
  test('prefixes with bracketed name', () => {
    expect(prefixLine('auth', 'ready')).toBe('[auth] ready');
  });
});

describe('pipePrefixed', () => {
  test('prefixes each complete line', async () => {
    const lines: string[] = [];
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('one\ntwo\n'));
        controller.close();
      },
    });
    await pipePrefixed(stream, 'vite', (line) => lines.push(line));
    expect(lines).toEqual(['[vite] one', '[vite] two']);
  });

  test('flushes trailing partial line on end', async () => {
    const lines: string[] = [];
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('partial'));
        controller.close();
      },
    });
    await pipePrefixed(stream, 'crm-helper', (line) => lines.push(line));
    expect(lines).toEqual(['[crm-helper] partial']);
  });

  test('no-ops on null stream', async () => {
    await pipePrefixed(null, 'x', () => {
      throw new Error('should not write');
    });
  });
});
