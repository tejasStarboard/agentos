# Built-in extensions

Shipped in `packages/core/builtins/`. Registry flags: `kind: "builtin"`, `driven: true`, `toggleable: false`.

## Driving (required)

| Id              | Role                                                                                                                                                 | Tech                                                                   |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| **auth**        | Identity, sessions, **RBAC**; public gate at `/login` `/register` `/reset-password`; Activity Bar **secondary** `ui/page.tsx` = **account settings** | Better Auth (+ db-store as needed)                                     |
| **db-store**    | Sole SQL owner                                                                                                                                       | Drizzle (SQLite default)                                               |
| **cache-store** | Sole cache owner                                                                                                                                     | In-memory v1                                                           |
| **ai**          | generateText/Image/embed, tools/skills/agents runtime                                                                                                | Vercel AI SDK v7 (mock default; [ADR 006](./adr/006-vercel-ai-sdk.md)) |

## Supporting (default-on)

| Id                | Role                                                                                                                           |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **hitl**          | Approvals API; Activity Bar **secondary** opens HITL panel in left sidebar (no `ui/`)                                          |
| **settings**      | App/platform preferences; Activity Bar **secondary** (`GearSix`) opens `ui/page.tsx` (distinct from Auth **account** settings) |
| **events**        | Cross-extension pub/sub                                                                                                        |
| **files**         | Blob/object API                                                                                                                |
| **notifications** | Toast/fan-out                                                                                                                  |
| **secrets**       | Secret resolution                                                                                                              |
| **audit**         | Append-only audit via db-store                                                                                                 |

## Access pattern

Customer (and most) APIs call builtins through `@agentos/core/api/*` or `agentos.*` — never hold `DATABASE_URL` themselves.

Extension Manager shows builtins as **locked**.
