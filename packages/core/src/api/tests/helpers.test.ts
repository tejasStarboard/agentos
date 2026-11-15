import { afterEach, describe, expect, test } from 'bun:test';

import {
  getExtConfig,
  getExtEnv,
  getGatewayUrl,
} from '@agentos/core/api/config';
import {
  HttpError,
  badRequest,
  forbidden,
  isHttpError,
  jsonError,
  notFound,
  toErrorResponse,
  unauthorized,
} from '@agentos/core/api/errors';
import { createLogger } from '@agentos/core/api/logging';
import { span, track } from '@agentos/core/api/telemetry';
import { createContext } from '@agentos/core/api';

afterEach(() => {
  // no-op: helpers are pure / console-backed
});

describe('errors', () => {
  test('HttpError + status helpers', async () => {
    const c = createContext(new Request('http://localhost/x'), {});
    expect(isHttpError(new HttpError(400, 'nope'))).toBe(true);
    expect(isHttpError(new Error('x'))).toBe(false);

    expect(await badRequest(c).json()).toEqual({ error: 'bad request' });
    expect(await unauthorized(c).json()).toEqual({ error: 'unauthenticated' });
    expect(await forbidden(c).json()).toEqual({ error: 'forbidden' });
    expect(await notFound(c).json()).toEqual({ error: 'not found' });
    expect(jsonError(c, 418, 'teapot').status).toBe(418);

    const fromHttp = toErrorResponse(c, new HttpError(409, 'conflict'));
    expect(fromHttp.status).toBe(409);
    expect(await fromHttp.json()).toEqual({ error: 'conflict' });

    const fromUnknown = toErrorResponse(c, new Error('boom'));
    expect(fromUnknown.status).toBe(500);
    expect(await fromUnknown.json()).toEqual({ error: 'boom' });
  });
});

describe('logging', () => {
  test('createLogger emits JSON lines', () => {
    const lines: string[] = [];
    const original = console.log;
    console.log = (...args: unknown[]) => {
      lines.push(String(args[0]));
    };
    try {
      const log = createLogger('test-scope');
      log.info('hello', { n: 1 });
      expect(lines).toHaveLength(1);
      const parsed = JSON.parse(lines[0]!);
      expect(parsed.level).toBe('info');
      expect(parsed.scope).toBe('test-scope');
      expect(parsed.message).toBe('hello');
      expect(parsed.n).toBe(1);
    } finally {
      console.log = original;
    }
  });
});

describe('config', () => {
  test('getGatewayUrl / getExtConfig / getExtEnv', () => {
    expect(getGatewayUrl({})).toBe('http://127.0.0.1:5173');
    expect(
      getExtConfig('db-store', {
        AGENT_OS_EXT_DB_STORE_PORT: '6111',
        AGENT_OS_EXT_DB_STORE_DATABASE_URL: 'postgres://x',
        OTHER: 'nope',
      }),
    ).toEqual({
      PORT: '6111',
      DATABASE_URL: 'postgres://x',
    });
    expect(getExtEnv('ai', 'MODEL', { AGENT_OS_EXT_AI_MODEL: 'gpt' })).toBe(
      'gpt',
    );
  });
});

describe('telemetry', () => {
  test('track and span', async () => {
    const lines: string[] = [];
    const original = console.log;
    console.log = (...args: unknown[]) => {
      lines.push(String(args[0]));
    };
    try {
      track('clicked', { button: 'save' });
      const value = await span('work', async () => 42, { job: 'x' });
      expect(value).toBe(42);
      expect(lines.some((l) => l.includes('"kind":"track"'))).toBe(true);
      expect(lines.some((l) => l.includes('"kind":"span.start"'))).toBe(true);
      expect(lines.some((l) => l.includes('"kind":"span.end"'))).toBe(true);
    } finally {
      console.log = original;
    }
  });

  test('span rethrows and logs error', async () => {
    const lines: string[] = [];
    const originalErr = console.error;
    console.error = (...args: unknown[]) => {
      lines.push(String(args[0]));
    };
    try {
      await expect(
        span('fail', async () => {
          throw new Error('nope');
        }),
      ).rejects.toThrow('nope');
      expect(lines.some((l) => l.includes('"kind":"span.error"'))).toBe(true);
    } finally {
      console.error = originalErr;
    }
  });
});
