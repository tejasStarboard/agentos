import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

import { CACHE_STORE_PORT } from './lib/constants';

type RuntimeEnv = Record<string, string | undefined>;

/** cache-store extension env (`AGENT_OS_EXT_CACHE_STORE_*`). Pass into app `createEnv({ extends: [keys()] })`. */
export const keys = (runtimeEnv: RuntimeEnv = Bun.env) =>
  createEnv({
    server: {
      AGENT_OS_EXT_CACHE_STORE_PORT: z.coerce
        .number()
        .int()
        .positive()
        .default(CACHE_STORE_PORT),
    },
    clientPrefix: 'AGENT_OS_EXT_CACHE_STORE_CLIENT',
    client: {},
    runtimeEnv: {
      AGENT_OS_EXT_CACHE_STORE_PORT: runtimeEnv.AGENT_OS_EXT_CACHE_STORE_PORT,
    },
    emptyStringAsUndefined: true,
  });
