# PRD — AgentOS experiment

## Problem

Forward Deployed Engineers need to ship product features as **isolated extensions** (UI + AI tools/skills + backend) without forking the host app or wiring registries by hand. Backends must be **production-shaped** (auth, RBAC, data access, AI) without every service opening the database.

## Goals

1. **Convention discovery** — drop files under `extensions/<id>/`; Shell and gateway pick them up (Next.js App Router–like DX).
2. **Sandbox UI** — extension views run in iframes over Comlink; crashes don’t take down the Shell.
3. **Per-feature backends** — Bun file-based `api/routes` or Python `services/<id>`.
4. **Driving builtins** — auth (Better Auth + RBAC), db-store, cache-store, AI always on.
5. **Clear vocabulary** — extension vs service vs package documented for humans and agents.
6. **Agent-ready** — custom skills so Cursor/Claude plan tickets against the real architecture.

## Non-goals (v1)

- Next.js host adapter (later spike).
- Real multi-region deploy / full MCP wire protocol.
- Letting customer services hold `DATABASE_URL`.

## Success metrics (experiment)

- `agentos dev` (via Bun) brings up Shell + builtins + sample CRM (Bun) + invoice-bot (Python).
- FDE can add a new extension UI file and see it hot-register.
- Disable customer extension → UI and proxy gone; builtins remain.
- Agent planning a ticket cites concepts.md boundaries correctly (via AgentOS skills).

## Personas

- **FDE** — builds customer extensions/services.
- **Platform eng** — owns `@agentos/core` and builtins.
- **Coding agent** — implements tickets; must load architecture skill first.
