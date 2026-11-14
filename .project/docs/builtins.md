# Built-in extensions

Shipped in `packages/core/builtins/`. Registry flags: `kind: "builtin"`, `driven: true`, `toggleable: false`.

## Driving (required)

| Id | Role | Tech |
|----|------|------|
| **auth** | Identity, sessions, **RBAC** | Better Auth (+ db-store as needed) |
| **db-store** | Sole SQL owner | Drizzle (SQLite default) |
| **cache-store** | Sole cache owner | In-memory v1 |
| **ai** | generateText/Image/embed, tools/skills/agents runtime | Mock providers v1 |

## Supporting (default-on)

| Id | Role |
|----|------|
| **hitl** | Approvals inbox/API |
| **events** | Cross-extension pub/sub |
| **files** | Blob/object API |
| **notifications** | Toast/fan-out |
| **secrets** | Secret resolution |
| **audit** | Append-only audit via db-store |

## Access pattern

Customer (and most) APIs call builtins through `@agentos/core/api/*` or `agentos.*` — never hold `DATABASE_URL` themselves.

Extension Manager shows builtins as **locked**.
