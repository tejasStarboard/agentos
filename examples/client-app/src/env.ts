import { createEnv } from '@t3-oss/env-core';
import { platformKeys } from '@agentos/core/api/env';
import { keys as authKeys } from '@agentos/core/builtins/auth/env';
import { keys as cacheStoreKeys } from '@agentos/core/builtins/cache-store/env';
import { keys as dbStoreKeys } from '@agentos/core/builtins/db-store/env';
import { keys as demoKeys } from '@extensions/demo/api/env';

/**
 * App-level env: extend platform + builtin + customer `keys()` instances.
 * Import from Bun API entrypoints (not iframe UI).
 */
export const env = createEnv({
  extends: [
    platformKeys(),
    authKeys(),
    dbStoreKeys(),
    cacheStoreKeys(),
    demoKeys(),
  ],
  server: {},
  clientPrefix: 'AGENT_OS_APP_CLIENT',
  client: {},
  runtimeEnv: Bun.env,
  emptyStringAsUndefined: true,
});
