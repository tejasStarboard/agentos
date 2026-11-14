import { describe, expect, test } from 'bun:test';
import { withRpcTimeout } from './timeout';
import { ExtensionRpcTimeoutError } from './types';

describe('withRpcTimeout', () => {
  test('resolves when the promise settles in time', async () => {
    await expect(
      withRpcTimeout('ext-a', 'onActivate', Promise.resolve('ok'), 500),
    ).resolves.toBe('ok');
  });

  test('rejects with ExtensionRpcTimeoutError when slow', async () => {
    const slow = new Promise<string>((resolve) => {
      setTimeout(() => resolve('late'), 200);
    });
    await expect(
      withRpcTimeout('ext-a', 'onActivate', slow, 20),
    ).rejects.toBeInstanceOf(ExtensionRpcTimeoutError);
  });

  test('propagates underlying rejection', async () => {
    await expect(
      withRpcTimeout(
        'ext-a',
        'onEvent',
        Promise.reject(new Error('boom')),
        500,
      ),
    ).rejects.toThrow('boom');
  });
});
