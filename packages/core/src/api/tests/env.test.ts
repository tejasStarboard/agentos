import { createEnv } from '@t3-oss/env-core';
import { describe, expect, test } from 'bun:test';
import { z } from 'zod';

import {
  assertExtKey,
  assertGlobalKey,
  extDomain,
  extKeyPrefix,
  platformKeys,
} from '@agentos/core/api/env';
import { keys as aiKeys } from '@agentos/core/builtins/ai/env';
import { keys as authKeys } from '@agentos/core/builtins/auth/env';
import { keys as cacheStoreKeys } from '@agentos/core/builtins/cache-store/env';
import { keys as dbStoreKeys } from '@agentos/core/builtins/db-store/env';

describe('env naming helpers', () => {
  test('extDomain uppercases and replaces hyphens', () => {
    expect(extDomain('auth')).toBe('AUTH');
    expect(extDomain('db-store')).toBe('DB_STORE');
    expect(extDomain('cache-store')).toBe('CACHE_STORE');
    expect(extDomain('demo')).toBe('DEMO');
  });

  test('extKeyPrefix builds AGENT_OS_EXT_<DOMAIN>_', () => {
    expect(extKeyPrefix('auth')).toBe('AGENT_OS_EXT_AUTH_');
    expect(extKeyPrefix('db-store')).toBe('AGENT_OS_EXT_DB_STORE_');
    expect(extKeyPrefix('cache-store')).toBe('AGENT_OS_EXT_CACHE_STORE_');
    expect(extKeyPrefix('DB_STORE')).toBe('AGENT_OS_EXT_DB_STORE_');
  });

  test('assertGlobalKey accepts only AGENT_OS_GLOBAL_*', () => {
    expect(() => assertGlobalKey('AGENT_OS_GLOBAL_NODE_ENV')).not.toThrow();
    expect(() => assertGlobalKey('NODE_ENV')).toThrow(/AGENT_OS_GLOBAL_/);
  });

  test('assertExtKey enforces domain prefix', () => {
    expect(() =>
      assertExtKey('AGENT_OS_EXT_AUTH_SECRET', 'auth'),
    ).not.toThrow();
    expect(() => assertExtKey('AGENT_OS_EXT_DEMO_GREETING', 'auth')).toThrow(
      /AGENT_OS_EXT_AUTH_/,
    );
  });
});

describe('createEnv extends keys()', () => {
  test('merges platform + extension keys with defaults on empty runtimeEnv', () => {
    const empty = {};
    const env = createEnv({
      extends: [
        platformKeys(empty),
        authKeys(empty),
        dbStoreKeys(empty),
        cacheStoreKeys(empty),
        aiKeys(empty),
      ],
      server: {},
      clientPrefix: 'AGENT_OS_APP_CLIENT',
      client: {},
      runtimeEnv: empty,
      emptyStringAsUndefined: true,
    });

    expect(env.AGENT_OS_EXT_AUTH_SECRET).toBe(
      'agentos-dev-auth-secret-min-32-chars!!',
    );
    expect(env.AGENT_OS_EXT_AUTH_PORT).toBe(6110);
    expect(env.AGENT_OS_EXT_DB_STORE_PORT).toBe(6111);
    expect(env.AGENT_OS_EXT_CACHE_STORE_PORT).toBe(6112);
    expect(env.AGENT_OS_EXT_AI_PORT).toBe(6113);
    expect(env.AGENT_OS_EXT_AUTH_DB).toBeUndefined();
    expect(env.AGENT_OS_GLOBAL_NODE_ENV).toBeUndefined();
  });

  test('loads values from runtimeEnv via keys()', () => {
    const runtimeEnv = {
      AGENT_OS_GLOBAL_NODE_ENV: 'test',
      AGENT_OS_EXT_AUTH_SECRET: 'custom-secret-at-least-32-characters!!',
      AGENT_OS_EXT_AUTH_PORT: '6120',
      AGENT_OS_EXT_AUTH_DB: '/tmp/auth.sqlite',
    };
    const env = createEnv({
      extends: [platformKeys(runtimeEnv), authKeys(runtimeEnv)],
      server: {},
      clientPrefix: 'AGENT_OS_APP_CLIENT',
      client: {},
      runtimeEnv,
      emptyStringAsUndefined: true,
    });

    expect(env.AGENT_OS_GLOBAL_NODE_ENV).toBe('test');
    expect(env.AGENT_OS_EXT_AUTH_SECRET).toBe(
      'custom-secret-at-least-32-characters!!',
    );
    expect(env.AGENT_OS_EXT_AUTH_PORT).toBe(6120);
    expect(env.AGENT_OS_EXT_AUTH_DB).toBe('/tmp/auth.sqlite');
  });

  test('treats empty string as undefined (defaults apply)', () => {
    const runtimeEnv = {
      AGENT_OS_EXT_AUTH_SECRET: '',
      AGENT_OS_EXT_AUTH_DB: '',
    };
    const env = authKeys(runtimeEnv);

    expect(env.AGENT_OS_EXT_AUTH_SECRET).toBe(
      'agentos-dev-auth-secret-min-32-chars!!',
    );
    expect(env.AGENT_OS_EXT_AUTH_DB).toBeUndefined();
  });

  test('fails fast on required key missing', () => {
    expect(() =>
      createEnv({
        server: {
          AGENT_OS_EXT_DEMO_TOKEN: z.string().min(1),
        },
        clientPrefix: 'AGENT_OS_EXT_DEMO_CLIENT',
        client: {},
        runtimeEnv: {},
        emptyStringAsUndefined: true,
        // Avoid t3-env's default console.error noise in CI output.
        onValidationError: () => {
          throw new Error('Invalid environment variables');
        },
      }),
    ).toThrow(/Invalid environment variables/);
  });
});
