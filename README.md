# AgentOS (experiment)

Convention-based extension platform: Shell + Comlink iframes + Bun APIs / Python services + driving builtins (auth, db-store, cache-store, ai).

## Start here

1. **[`.project/docs/concepts.md`](.project/docs/concepts.md)** — extension vs service vs packages  
2. **[`.project/docs/README.md`](.project/docs/README.md)** — full docs index  
3. **[`.project/tickets/`](.project/tickets/)** — ordered build tickets (`todo` → `in-progress` → `done`)  
4. **[`AGENTS.md`](AGENTS.md)** — instructions for Cursor / Claude  

**Do not start build tickets (1+) until explicitly asked.** Docs and skills are already set up.

## Tooling policy

| Concern | Tool |
|---------|------|
| Workspace install | **pnpm** |
| Run TS/JS services | **Bun** (`bun run` / `bunx`) — not Node |
| Python services | uv / uvicorn |

See [ADR 001](.project/docs/adr/001-pnpm-bun-hybrid.md).

## Agent skills

Custom (required for planning):

- `.agents/skills/agentos-architecture`
- `.agents/skills/agentos-ticket-planner`
- `.agents/skills/agentos-bun-runtime`

Vendored UI/React/Bun skills: `.agents/skills/vendor/` (symlinked under `.cursor/skills/`).

Details: [`.project/docs/skills.md`](.project/docs/skills.md).

## Status

Legacy `@app/*` workspace reset is done (ticket **1**). Next: scaffold monorepo (ticket **2**).
