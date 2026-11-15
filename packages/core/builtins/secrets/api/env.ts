import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

import { SECRETS_PORT } from './lib/constants';

type RuntimeEnv = Record<string, string | undefined>;

/** secrets extension env (`AGENT_OS_EXT_SECRETS_*`). Pass into app `createEnv({ extends: [keys()] })`. */
export const keys = (runtimeEnv: RuntimeEnv = Bun.env) =>
  createEnv({
    server: {
      AGENT_OS_EXT_SECRETS_PORT: z.coerce
        .number()
        .int()
        .positive()
        .default(SECRETS_PORT),
      /** Optional JSON object of secret key → value. */
      AGENT_OS_EXT_SECRETS_MAP: z.string().min(1).optional(),
    },
    clientPrefix: 'AGENT_OS_EXT_SECRETS_CLIENT',
    client: {},
    runtimeEnv: {
      AGENT_OS_EXT_SECRETS_PORT: runtimeEnv.AGENT_OS_EXT_SECRETS_PORT,
      AGENT_OS_EXT_SECRETS_MAP: runtimeEnv.AGENT_OS_EXT_SECRETS_MAP,
    },
    emptyStringAsUndefined: true,
  });
