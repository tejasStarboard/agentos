import { describe, expect, test } from 'bun:test';

import { handleSecretsRequest } from '@agentos/core/builtins/secrets/api/lib/handle-request';

describe('builtin secrets server', () => {
  test('resolves from map and per-key env', async () => {
    const runtimeEnv = {
      AGENT_OS_EXT_SECRETS_MAP: JSON.stringify({ stripe: 'sk_map' }),
      AGENT_OS_EXT_SECRETS_API_TOKEN: 'tok_env',
    };

    const health = await handleSecretsRequest(
      { runtimeEnv },
      new Request('http://127.0.0.1:6118/health'),
    );
    expect(await health.json()).toEqual({ ok: true });

    const fromMap = await handleSecretsRequest(
      { runtimeEnv },
      new Request('http://127.0.0.1:6118/secrets/stripe'),
    );
    expect(fromMap.status).toBe(200);
    expect(await fromMap.json()).toEqual({ key: 'stripe', value: 'sk_map' });

    const fromEnv = await handleSecretsRequest(
      { runtimeEnv },
      new Request('http://127.0.0.1:6118/secrets/api-token'),
    );
    expect(fromEnv.status).toBe(200);
    expect(await fromEnv.json()).toEqual({
      key: 'api-token',
      value: 'tok_env',
    });

    const missing = await handleSecretsRequest(
      { runtimeEnv },
      new Request('http://127.0.0.1:6118/secrets/missing'),
    );
    expect(missing.status).toBe(404);
  });
});
