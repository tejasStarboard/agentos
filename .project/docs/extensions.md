# Extensions

An **extension** is a feature unit discovered by convention.

## Layout

```text
extensions/<id>/
  meta.json
  ui/
    page.tsx       # main slot → /ext/<id>
    sidebar.tsx    # left sidebar
    widget.tsx     # home dashboard card
  agent/
    tools.json     # tool schemas → HTTP
    skills.ts      # /slash skills
    instructions.md
  api/             # optional — Bun only
    env.ts         # optional — export `keys` (Zod schemas)
    server.ts
    routes/
      tools/
        search_contacts/index.ts
```

## Env (`api/env.ts`)

Each extension exports a `keys()` factory that returns a `@t3-oss/env-core` `createEnv` instance. The app extends those instances — no custom merge helper.

```ts
// extensions/crm/api/env.ts
import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const keys = (runtimeEnv = Bun.env) =>
  createEnv({
    server: {
      AGENT_OS_EXT_CRM_API_TOKEN: z.string().min(1),
    },
    clientPrefix: 'AGENT_OS_EXT_CRM_CLIENT',
    client: {},
    runtimeEnv: {
      AGENT_OS_EXT_CRM_API_TOKEN: runtimeEnv.AGENT_OS_EXT_CRM_API_TOKEN,
    },
    emptyStringAsUndefined: true,
  });
// Always set: server, client, clientPrefix, runtimeEnv
```

| Scope             | Pattern                       | Example                    |
| ----------------- | ----------------------------- | -------------------------- |
| Global / platform | `AGENT_OS_GLOBAL_<VAR>`       | `AGENT_OS_GLOBAL_NODE_ENV` |
| Extension         | `AGENT_OS_EXT_<DOMAIN>_<VAR>` | `AGENT_OS_EXT_AUTH_SECRET` |

Domain = extension id uppercased with `-` → `_` (`db-store` → `DB_STORE`).

```ts
import { createEnv } from '@t3-oss/env-core';
import { platformKeys } from '@agentos/core/api/env';
import { keys as authKeys } from '@agentos/core/builtins/auth/env';
import { keys as crmKeys } from '@extensions/crm/api/env';

export const env = createEnv({
  extends: [platformKeys(), authKeys(), crmKeys()],
  server: {},
  clientPrefix: 'AGENT_OS_APP_CLIENT',
  client: {},
  runtimeEnv: Bun.env,
  emptyStringAsUndefined: true,
});
```

Every `createEnv` / `keys()` call must define `server`, `client`, `clientPrefix`, and `runtimeEnv`.

Server-side only — never put secrets in `@agentos/core/client` / iframe UI.

## meta.json (Bun API)

```json
{
  "name": "CRM Helper",
  "icon": "Users",
  "api": {
    "language": "bun",
    "port": 6101,
    "routesDir": "api/routes"
  }
}
```

## meta.json (Python service)

```json
{
  "name": "Invoice Bot",
  "icon": "Receipt",
  "api": {
    "language": "python",
    "root": "../../services/invoice-bot",
    "port": 6102,
    "health": "/health"
  }
}
```

Optional `icon` is a Phosphor icon basename (`"Users"` → `UsersIcon`) for Activity Bar and Extension Manager. Unknown or missing values fall back to `Cube`. Curated names live in `@agentos/core` `resolveExtensionIcon` / `EXTENSION_ICON_MAP`.

## File-based routes (Bun)

Wire the kit in `api/server.ts`, then place handlers under `api/routes/**/index.ts`.
Folder segments map to the path; `[param]` becomes `:param`. `createApp` registers
`GET /health` → `{ ok: true }` (override with `api/routes/health/index.ts` if needed).

```ts
// api/server.ts
import { createApp, loadRoutes } from '@agentos/core/api';

const app = createApp();
await loadRoutes(app, `${import.meta.dir}/routes`);
Bun.serve({ port: 6101, fetch: app.fetch });
```

`api/routes/tools/search_contacts/index.ts` → `POST /tools/search_contacts`.
`api/routes/contacts/[id]/index.ts` → `GET /contacts/:id` (via `c.req.param('id')`).

```ts
import { requirePermissions } from '@agentos/core/api/auth';
import { dbStore } from '@agentos/core/api/store';
import type { RouteHandlers } from '@agentos/core/api';

export const middleware = [requirePermissions('crm.read')];

export const POST: RouteHandlers['POST'] = async (c) => {
  const input = await c.req.json();
  return c.json(await dbStore.collection('contacts').query(input));
};
```

## UI

Import `@agentos/core/client` for host SDK hooks (`HostProvider`, `useHostStorage`, `useHostAI`, `useHostHITL`, `useHostNotifications`, `useHostApi`). **`@agentos/core/client` is for `ui/*.tsx` only** — never import it from `api/routes/**` or Python services (use `@agentos/core/api/*` / `agentos.*` there). For base controls (buttons, inputs, checkboxes, selects, dropdowns, …) import from **`@agentos/ui/components/*`** (shadcn) — do not use native HTML controls unless specifically required. Views are wrapped by framework iframe bootstrap — no Comlink / handshake boilerplate in FDE code.

## Builtins

Same folder conventions under `packages/core/builtins/<id>/`, with `driven: true`.
