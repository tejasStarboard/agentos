# Packages

## `@agentos/core` (TypeScript)

Framework package. Parent exports:

| Export                     | Who              | Responsibility                                |
| -------------------------- | ---------------- | --------------------------------------------- |
| `@agentos/core`            | App `main.tsx`   | `mountShell()`, shared types                  |
| `@agentos/core/client`     | `ui/*.tsx`       | Comlink + React hooks                         |
| `@agentos/core/api`        | `api/routes/**`  | `createApp`, `loadRoutes`                     |
| `@agentos/core/api/auth`   | API routes       | Session + RBAC (Better Auth)                  |
| `@agentos/core/api/store`  | API routes       | `dbStore`, `cacheStore` clients               |
| `@agentos/core/api/ai`     | API routes       | AI client                                     |
| `@agentos/core/api/hitl` … | API routes       | Other builtin clients                         |
| `@agentos/core/vite`       | `vite.config.ts` | Scanner, virtual modules, gateway             |
| `@agentos/core/sdk`        | Advanced         | Low-level Comlink                             |
| `agentos` CLI              | Scripts          | `dev` / `build` (starts Shell + APIs via Bun) |

Internal (not FDE import paths): `shell/`, `agent/` (gateway helpers), `builtins/`.

## `agentos` (Python)

Separate pip/uv package under `packages/python`. Mirrors `/api` domains: `agentos.auth`, `agentos.store`, `agentos.ai`, etc. **Only** for `services/<id>/`.

## Consumer

`examples/client-app` — depends on `@agentos/core`, owns `extensions/` and optionally `services/`.

## Tooling

- Install: `pnpm install` at repo root.
- Run TS: `bun run` / `bun ./path.ts`.
- Never: `node server.js` for platform APIs.
