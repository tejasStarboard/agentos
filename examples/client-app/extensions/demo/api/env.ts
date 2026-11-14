import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

type RuntimeEnv = Record<string, string | undefined>;

/** Demo extension env (`AGENT_OS_EXT_DEMO_*`). Pass into app `createEnv({ extends: [keys()] })`. */
export const keys = (runtimeEnv: RuntimeEnv = Bun.env) =>
  createEnv({
    server: {
      AGENT_OS_EXT_DEMO_GREETING: z.string().min(1).optional(),
    },
    clientPrefix: 'AGENT_OS_EXT_DEMO_CLIENT',
    client: {},
    runtimeEnv: {
      AGENT_OS_EXT_DEMO_GREETING: runtimeEnv.AGENT_OS_EXT_DEMO_GREETING,
    },
    emptyStringAsUndefined: true,
  });
