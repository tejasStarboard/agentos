# AgentOS (experiment)

Convention-based extension platform: Shell + Comlink iframes + Bun APIs / Python services + driving builtins (auth, db-store, cache-store, ai).

**Repository:** [github.com/tejasStarboard/agentos](https://github.com/tejasStarboard/agentos)

## Start here

1. **[`.project/docs/concepts.md`](.project/docs/concepts.md)** — extension vs service vs packages
2. **[`.project/docs/README.md`](.project/docs/README.md)** — full docs index
3. **[`.project/tickets/`](.project/tickets/)** — ordered build tickets (`todo` → `in-progress` → `done`)
4. **[`AGENTS.md`](AGENTS.md)** — instructions for Cursor / Claude

## Tooling policy

| Concern            | Tool                                    |
| ------------------ | --------------------------------------- |
| Workspace install  | **pnpm**                                |
| Run TS/JS services | **Bun** (`bun run` / `bunx`) — not Node |
| Python services    | uv / uvicorn                            |

See [ADR 001](.project/docs/adr/001-pnpm-bun-hybrid.md).

```bash
pnpm install
bun run dev          # sample client-app (Vite + builtins + services)
bun run ci           # lint, format, typecheck, build, test
```

## Packages

| Package                                                | Role                                                                   |
| ------------------------------------------------------ | ---------------------------------------------------------------------- |
| [`@agentos/core`](packages/core/README.md)             | Shell, Comlink SDK, Bun API kit, Vite gateway, builtins, `agentos` CLI |
| [`@agentos/ui`](packages/ui/README.md)                 | Shared shadcn + Tailwind primitives                                    |
| [`agentos` (Python)](packages/python/README.md)        | SDK for `services/<id>/` FastAPI backends                              |
| [`@agentos/client-app`](examples/client-app/README.md) | Sample consumer app + extensions                                       |

## Agent skills

Custom (required for planning):

- `.agents/skills/agentos-architecture`
- `.agents/skills/agentos-ticket-planner`
- `.agents/skills/agentos-bun-runtime`

Vendored UI/React/Bun skills: `.agents/skills/vendor/` (symlinked under `.cursor/skills/`).

Details: [`.project/docs/skills.md`](.project/docs/skills.md).

## Status

Core platform experiment is largely built (Shell, gateway, builtins, API kit, Python SDK, sample CRM + invoice-bot). Remaining work lives under [`.project/tickets/`](.project/tickets/) (`todo` / `in-progress`). See [roadmap](.project/docs/roadmap.md) for phase context.

**Do not start build tickets until explicitly asked.** Prefer reading concepts + the active ticket before coding.
