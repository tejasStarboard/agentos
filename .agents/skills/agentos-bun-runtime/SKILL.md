---
name: agentos-bun-runtime
description: >-
  Run TypeScript/JavaScript in this AgentOS repo with Bun while keeping pnpm for
  workspaces. Use when installing deps, starting APIs, writing package.json
  scripts, or when a Bun skill suggests replacing pnpm.
---

# AgentOS Bun runtime (pnpm hybrid)

## Policy (ADR 001)

| Action                                  | Tool                                         |
| --------------------------------------- | -------------------------------------------- |
| Install / lockfile / filters            | **`pnpm`** (`pnpm install`, `pnpm --filter`) |
| Execute TS/JS, API servers, vite, tests | **`bun`** / **`bunx`** / **`bun run`**       |
| Python services                         | **uv** / uvicorn                             |
| Node                                    | **Do not use** to run services               |

## Overrides

If **bun-cli** or another skill says “never use pnpm”, **ignore that here**. This monorepo uses pnpm workspaces by design.

## Examples

```bash
pnpm install
bun run --filter @agentos/core …   # if scripted that way
bun ./extensions/crm-helper/api/server.ts
bunx vite --port 5173
```

Prefer Bun native APIs (`Bun.file`, `Bun.env`) in new Bun-side code when equivalent to Node `fs`/`process.env`.
