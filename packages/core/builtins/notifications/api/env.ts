import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

import { NOTIFICATIONS_PORT } from './lib/constants';

type RuntimeEnv = Record<string, string | undefined>;

/** notifications extension env (`AGENT_OS_EXT_NOTIFICATIONS_*`). Pass into app `createEnv({ extends: [keys()] })`. */
export const keys = (runtimeEnv: RuntimeEnv = Bun.env) =>
  createEnv({
    server: {
      AGENT_OS_EXT_NOTIFICATIONS_PORT: z.coerce
        .number()
        .int()
        .positive()
        .default(NOTIFICATIONS_PORT),
    },
    clientPrefix: 'AGENT_OS_EXT_NOTIFICATIONS_CLIENT',
    client: {},
    runtimeEnv: {
      AGENT_OS_EXT_NOTIFICATIONS_PORT:
        runtimeEnv.AGENT_OS_EXT_NOTIFICATIONS_PORT,
    },
    emptyStringAsUndefined: true,
  });
