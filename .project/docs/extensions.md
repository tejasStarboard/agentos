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
    server.ts
    routes/
      tools/
        search_contacts/index.ts
```

## meta.json (Bun API)

```json
{
  "name": "CRM Helper",
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
  "api": {
    "language": "python",
    "root": "../../services/invoice-bot",
    "port": 6102,
    "health": "/health"
  }
}
```

## File-based routes (Bun)

`api/routes/tools/search_contacts/index.ts` → `POST /tools/search_contacts`.

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
