import { describe, expect, test } from 'bun:test';

import { main } from '../lib/run';

describe('main', () => {
  test('returns 1 when command missing', async () => {
    const code = await main(['bun', 'agentos']);
    expect(code).toBe(1);
  });

  test('returns 0 for help', async () => {
    const code = await main(['bun', 'agentos', 'help']);
    expect(code).toBe(0);
  });

  test('returns 1 for unknown args', async () => {
    const code = await main(['bun', 'agentos', 'dev', '--nope']);
    expect(code).toBe(1);
  });

  test('returns 1 for invalid consumer cwd on build', async () => {
    const code = await main([
      'bun',
      'agentos',
      'build',
      '--cwd',
      '/tmp/agentos-definitely-missing',
    ]);
    expect(code).toBe(1);
  });
});
