# `@agentos/core`

AgentOS framework package: Shell host, Comlink SDK, Bun API kit, Vite plugin/gateway, builtins, and the `agentos` CLI.

## Install (workspace)

This package is private and consumed via pnpm workspaces:

```json
{ "dependencies": { "@agentos/core": "workspace:*" } }
```

## Entry points

| Import                                        | Use for                              |
| --------------------------------------------- | ------------------------------------ |
| `@agentos/core` / `@agentos/core/shell/mount` | `mountShell()` from the consumer app |
| `@agentos/core/client`                        | Extension UI iframes only            |
| `@agentos/core/api/*`                         | Bun extension API routes only        |
| `@agentos/core/vite`                          | `vite.config.ts` plugin + gateway    |
| `@agentos/core/sdk`                           | Low-level Comlink helpers            |
| `agentos` (bin)                               | Local `dev` / `build`                |

Full export map: [`.project/docs/packages.md`](../../.project/docs/packages.md). Concepts: [`.project/docs/concepts.md`](../../.project/docs/concepts.md).

## Runtime

- **pnpm** installs the monorepo; **Bun** runs TS/JS (never Node for services). See [ADR 001](../../.project/docs/adr/001-pnpm-bun-hybrid.md).
- UI primitives come from [`@agentos/ui`](../ui/README.md), not ad-hoc HTML controls.

## Develop

From repo root:

```bash
pnpm install
bun run --filter @agentos/core typecheck
bun test packages/core
```
