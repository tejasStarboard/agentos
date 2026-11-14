import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

import { AUTH_PORT } from './lib/constants';

type RuntimeEnv = Record<string, string | undefined>;

/** Auth extension env (`AGENT_OS_EXT_AUTH_*`). Pass into app `createEnv({ extends: [keys()] })`. */
export const keys = (runtimeEnv: RuntimeEnv = Bun.env) =>
  createEnv({
    server: {
      AGENT_OS_EXT_AUTH_SECRET: z
        .string()
        .min(1)
        .default('agentos-dev-auth-secret-min-32-chars!!'),
      AGENT_OS_EXT_AUTH_DB: z.string().min(1).optional(),
      AGENT_OS_EXT_AUTH_BASE_URL: z.url().optional(),
      AGENT_OS_EXT_AUTH_PORT: z.coerce
        .number()
        .int()
        .positive()
        .default(AUTH_PORT),
    },
    clientPrefix: 'AGENT_OS_EXT_AUTH_CLIENT',
    client: {},
    runtimeEnv: {
      AGENT_OS_EXT_AUTH_SECRET: runtimeEnv.AGENT_OS_EXT_AUTH_SECRET,
      AGENT_OS_EXT_AUTH_DB: runtimeEnv.AGENT_OS_EXT_AUTH_DB,
      AGENT_OS_EXT_AUTH_BASE_URL: runtimeEnv.AGENT_OS_EXT_AUTH_BASE_URL,
      AGENT_OS_EXT_AUTH_PORT: runtimeEnv.AGENT_OS_EXT_AUTH_PORT,
    },
    emptyStringAsUndefined: true,
  });
