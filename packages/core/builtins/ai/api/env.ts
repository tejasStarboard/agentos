import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

import { AI_PORT, DEFAULT_GATEWAY_URL } from './lib/constants';

type RuntimeEnv = Record<string, string | undefined>;

/** AI extension env (`AGENT_OS_EXT_AI_*`). Pass into app `createEnv({ extends: [keys()] })`. */
export const keys = (runtimeEnv: RuntimeEnv = Bun.env) =>
  createEnv({
    server: {
      AGENT_OS_EXT_AI_PORT: z.coerce.number().int().positive().default(AI_PORT),
      AGENT_OS_EXT_AI_GATEWAY_URL: z
        .string()
        .url()
        .default(DEFAULT_GATEWAY_URL),
      /** Unset → mock models via `ai/test` (ADR 006). */
      AGENT_OS_EXT_AI_MODEL: z.string().min(1).optional(),
    },
    clientPrefix: 'AGENT_OS_EXT_AI_CLIENT',
    client: {},
    runtimeEnv: {
      AGENT_OS_EXT_AI_PORT: runtimeEnv.AGENT_OS_EXT_AI_PORT,
      AGENT_OS_EXT_AI_GATEWAY_URL: runtimeEnv.AGENT_OS_EXT_AI_GATEWAY_URL,
      AGENT_OS_EXT_AI_MODEL: runtimeEnv.AGENT_OS_EXT_AI_MODEL,
    },
    emptyStringAsUndefined: true,
  });
