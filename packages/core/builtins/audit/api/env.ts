import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

import { AUDIT_PORT, DEFAULT_DB_STORE_PORT } from './lib/constants';

type RuntimeEnv = Record<string, string | undefined>;

/** audit extension env (`AGENT_OS_EXT_AUDIT_*`). Pass into app `createEnv({ extends: [keys()] })`. */
export const keys = (runtimeEnv: RuntimeEnv = Bun.env) =>
  createEnv({
    server: {
      AGENT_OS_EXT_AUDIT_PORT: z.coerce
        .number()
        .int()
        .positive()
        .default(AUDIT_PORT),
      /** Peer db-store port for append-only audit log. */
      AGENT_OS_EXT_AUDIT_DB_STORE_PORT: z.coerce
        .number()
        .int()
        .positive()
        .default(DEFAULT_DB_STORE_PORT),
      AGENT_OS_EXT_AUDIT_DB_STORE_HOST: z.string().min(1).default('127.0.0.1'),
    },
    clientPrefix: 'AGENT_OS_EXT_AUDIT_CLIENT',
    client: {},
    runtimeEnv: {
      AGENT_OS_EXT_AUDIT_PORT: runtimeEnv.AGENT_OS_EXT_AUDIT_PORT,
      AGENT_OS_EXT_AUDIT_DB_STORE_PORT:
        runtimeEnv.AGENT_OS_EXT_AUDIT_DB_STORE_PORT ??
        runtimeEnv.AGENT_OS_EXT_DB_STORE_PORT,
      AGENT_OS_EXT_AUDIT_DB_STORE_HOST:
        runtimeEnv.AGENT_OS_EXT_AUDIT_DB_STORE_HOST,
    },
    emptyStringAsUndefined: true,
  });
