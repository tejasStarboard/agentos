import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

import { EVENTS_PORT } from './lib/constants';

type RuntimeEnv = Record<string, string | undefined>;

/** events extension env (`AGENT_OS_EXT_EVENTS_*`). Pass into app `createEnv({ extends: [keys()] })`. */
export const keys = (runtimeEnv: RuntimeEnv = Bun.env) =>
  createEnv({
    server: {
      AGENT_OS_EXT_EVENTS_PORT: z.coerce
        .number()
        .int()
        .positive()
        .default(EVENTS_PORT),
    },
    clientPrefix: 'AGENT_OS_EXT_EVENTS_CLIENT',
    client: {},
    runtimeEnv: {
      AGENT_OS_EXT_EVENTS_PORT: runtimeEnv.AGENT_OS_EXT_EVENTS_PORT,
    },
    emptyStringAsUndefined: true,
  });
