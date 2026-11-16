import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

type RuntimeEnv = Record<string, string | undefined>;

/** Starter extension env (`AGENT_OS_EXT_STARTER_*`). */
export const keys = (runtimeEnv: RuntimeEnv = Bun.env) =>
  createEnv({
    server: {
      AGENT_OS_EXT_STARTER_GREETING: z.string().min(1).optional(),
    },
    clientPrefix: 'AGENT_OS_EXT_STARTER_CLIENT',
    client: {},
    runtimeEnv: {
      AGENT_OS_EXT_STARTER_GREETING: runtimeEnv.AGENT_OS_EXT_STARTER_GREETING,
    },
    emptyStringAsUndefined: true,
  });
