# Agent instructions (AgentOS)

This repository is the **AgentOS** experiment. Coding agents must follow project docs and skills.

## Required reading

1. [`.project/docs/concepts.md`](.project/docs/concepts.md) — extension vs service vs packages  
2. [`.project/docs/architecture.md`](.project/docs/architecture.md)  
3. Skills:
   - [`.agents/skills/agentos-architecture/SKILL.md`](.agents/skills/agentos-architecture/SKILL.md)
   - [`.agents/skills/agentos-ticket-planner/SKILL.md`](.agents/skills/agentos-ticket-planner/SKILL.md)
   - [`.agents/skills/agentos-bun-runtime/SKILL.md`](.agents/skills/agentos-bun-runtime/SKILL.md)
   - [`.agents/skills/agentos-git-workflow/SKILL.md`](.agents/skills/agentos-git-workflow/SKILL.md) — commits/PRs (`dev`/`main`)

## Hard rules

- **pnpm** for workspace install; **Bun** to run all TS/JS; **never Node** for services.
- UI → `@agentos/core/client` only. API routes → `@agentos/core/api/*` only.
- Python backends → `services/<id>/`, not inside `extensions/`.
- No customer `DATABASE_URL` — use builtin **db-store** / **cache-store**.
- Auth+RBAC → builtin **auth** (Better Auth) via `@agentos/core/api/auth` only.

## Tickets

Work is ordered in [`.project/tickets/`](.project/tickets/). Do not start **build** tickets (1+) until the user explicitly asks. Docs/skills setup is separate.

## Docs index

[`.project/docs/README.md`](.project/docs/README.md)
