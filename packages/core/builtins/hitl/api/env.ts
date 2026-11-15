import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

import { HITL_PORT } from './lib/constants';

type RuntimeEnv = Record<string, string | undefined>;

/** hitl extension env (`AGENT_OS_EXT_HITL_*`). Pass into app `createEnv({ extends: [keys()] })`. */
export const keys = (runtimeEnv: RuntimeEnv = Bun.env) =>
  createEnv({
    server: {
      AGENT_OS_EXT_HITL_PORT: z.coerce
        .number()
        .int()
        .positive()
        .default(HITL_PORT),
    },
    clientPrefix: 'AGENT_OS_EXT_HITL_CLIENT',
    client: {},
    runtimeEnv: {
      AGENT_OS_EXT_HITL_PORT: runtimeEnv.AGENT_OS_EXT_HITL_PORT,
    },
    emptyStringAsUndefined: true,
  });
