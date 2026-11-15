import { describe, expect, test } from 'bun:test';

import { resolveExtApiBase, resolveGatewayUrl } from '@agentos/core/api/http';

describe('resolveGatewayUrl', () => {
  test('defaults to local Vite gateway', () => {
    expect(resolveGatewayUrl({})).toBe('http://127.0.0.1:5173');
  });

  test('strips trailing slash from AGENT_OS_GLOBAL_GATEWAY_URL', () => {
    expect(
      resolveGatewayUrl({
        AGENT_OS_GLOBAL_GATEWAY_URL: 'http://gw.example/',
      }),
    ).toBe('http://gw.example');
  });
});

describe('resolveExtApiBase', () => {
  test('builds /api/ext/{id} from gateway', () => {
    expect(resolveExtApiBase('ai', 'AGENT_OS_AI_API_BASE', {})).toBe(
      'http://127.0.0.1:5173/api/ext/ai',
    );
  });

  test('override env key wins', () => {
    expect(
      resolveExtApiBase('ai', 'AGENT_OS_AI_API_BASE', {
        AGENT_OS_AI_API_BASE: 'http://127.0.0.1:6113/',
      }),
    ).toBe('http://127.0.0.1:6113');
  });
});
