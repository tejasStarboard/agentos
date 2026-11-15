import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

type RuntimeEnv = Record<string, string | undefined>;

/** CRM Helper extension env (`AGENT_OS_EXT_CRM_HELPER_*`). */
export const keys = (runtimeEnv: RuntimeEnv = Bun.env) =>
  createEnv({
    server: {
      AGENT_OS_EXT_CRM_HELPER_API_TOKEN: z.string().min(1).optional(),
    },
    clientPrefix: 'AGENT_OS_EXT_CRM_HELPER_CLIENT',
    client: {},
    runtimeEnv: {
      AGENT_OS_EXT_CRM_HELPER_API_TOKEN:
        runtimeEnv.AGENT_OS_EXT_CRM_HELPER_API_TOKEN,
    },
    emptyStringAsUndefined: true,
  });
