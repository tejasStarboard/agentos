# 33 — Global + extension env config (`@t3-oss/env-core`)

**Status:** in-progress

## Goal

Typed, validated environment configuration for the platform and every extension using [`@t3-oss/env-core`](https://env.t3.gg/docs/core).

- **Global / platform** exports `platformKeys = () => createEnv(...)` (`AGENT_OS_GLOBAL_*`).
- **Each extension** exports `keys = () => createEnv(...)` (`AGENT_OS_EXT_<DOMAIN>_*`).
- **App** imports those factories and builds one env with native `extends`:

```ts
createEnv({ extends: [platformKeys(), authKeys(), demoKeys()], ... })
```

## Naming

| Scope     | Pattern                       | Example                    |
| --------- | ----------------------------- | -------------------------- |
| Global    | `AGENT_OS_GLOBAL_<VAR>`       | `AGENT_OS_GLOBAL_NODE_ENV` |
| Extension | `AGENT_OS_EXT_<DOMAIN>_<VAR>` | `AGENT_OS_EXT_AUTH_SECRET` |

Domain = extension id uppercased, `-` → `_` (`db-store` → `DB_STORE`).

## Done when

- [x] `@t3-oss/env-core` (+ Zod) available where Bun APIs / app bootstrap run
- [x] Platform module exports `platformKeys` + naming helpers (`@agentos/core/api/env`)
- [x] Convention: each extension exports `keys()` returning `createEnv(...)`
- [x] App aggregates via `createEnv({ extends: [keys(), ...] })`
- [x] Typed `env` usable from builtins / app (no ad-hoc `Bun.env` for declared keys)
- [x] Auth + demo migrate onto this path
- [x] Missing/invalid required keys fail fast; optional keys documented
- [x] Concepts / packages / extensions docs updated

## Notes

```ts
// examples/client-app/src/env.ts
import { createEnv } from '@t3-oss/env-core';
import { authKeys, dbStoreKeys, platformKeys } from '@agentos/core/api/env';
import { keys as demoKeys } from '@extensions/demo/api/env';

export const env = createEnv({
  extends: [platformKeys(), authKeys(), dbStoreKeys(), demoKeys()],
  server: {},
  clientPrefix: 'AGENT_OS_APP_CLIENT',
  client: {},
  runtimeEnv: Bun.env,
  emptyStringAsUndefined: true,
});
```

Every `createEnv` / `keys()` defines `server`, `client`, `clientPrefix`, and `runtimeEnv`. Standalone builtin servers call their own `keys()` directly.
