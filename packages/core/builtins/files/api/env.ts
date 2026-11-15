import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

import { FILES_PORT } from './lib/constants';

type RuntimeEnv = Record<string, string | undefined>;

/** files extension env (`AGENT_OS_EXT_FILES_*`). Pass into app `createEnv({ extends: [keys()] })`. */
export const keys = (runtimeEnv: RuntimeEnv = Bun.env) =>
  createEnv({
    server: {
      AGENT_OS_EXT_FILES_PORT: z.coerce
        .number()
        .int()
        .positive()
        .default(FILES_PORT),
      AGENT_OS_EXT_FILES_PATH: z.string().min(1).optional(),
    },
    clientPrefix: 'AGENT_OS_EXT_FILES_CLIENT',
    client: {},
    runtimeEnv: {
      AGENT_OS_EXT_FILES_PORT: runtimeEnv.AGENT_OS_EXT_FILES_PORT,
      AGENT_OS_EXT_FILES_PATH: runtimeEnv.AGENT_OS_EXT_FILES_PATH,
    },
    emptyStringAsUndefined: true,
  });
