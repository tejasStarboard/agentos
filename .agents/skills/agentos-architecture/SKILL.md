---
name: agentos-architecture
description: >-
  Understand and apply the AgentOS platform architecture. Use when planning or
  implementing any ticket under .project/tickets, designing extensions/services,
  touching @agentos/core, @agentos/ui, builtins, gateway, Comlink iframes, Bun
  APIs, or Python services. Also use when the user mentions AgentOS, mountShell,
  db-store, extensions/, services/, or shadcn/Tailwind UI primitives.
---

# AgentOS architecture skill

Before proposing designs or code for this repo, load the canonical docs:

1. `.project/docs/concepts.md` — **required** (glossary + boundaries)
2. `.project/docs/architecture.md`
3. Relevant: `extensions.md`, `services.md`, `packages.md`, `builtins.md`, `adr/*`

## Non-negotiable boundaries

| Layer                        | Import / place                            | Forbidden                                            |
| ---------------------------- | ----------------------------------------- | ---------------------------------------------------- |
| Extension UI (`ui/*.tsx`)    | `@agentos/core/client`                    | `@agentos/core/api`, direct DB                       |
| UI primitives (buttons, …)   | `@agentos/ui/components/*` (shadcn)       | Native `<button>`/`<input>`/`<select>` by default    |
| Extension API (`api/routes`) | `@agentos/core/api/*`, run with **Bun**   | Node runtime, `DATABASE_URL`, `@agentos/core/client` |
| Python backend               | `services/<id>/` + `agentos.*`            | Python inside `extensions/<id>/`                     |
| Auth / RBAC                  | builtin `auth` + `@agentos/core/api/auth` | Separate rbac builtin or `/api/rbac`                 |
| SQL / cache                  | `dbStore` / `cacheStore` → builtins       | Drizzle/Redis in customer code                       |

## UI design philosophy

- Base-level controls (**Button**, **Input**, **Checkbox**, **Select**, **DropdownMenu**, dialogs, etc.) come from **`@agentos/ui`** (shadcn + Tailwind).
- Do **not** use native HTML control tags unless specifically required (landmarks/`<form>`, slot hosts, missing primitive, a11y edge case).
- Style with Tailwind tokens from `@agentos/ui/globals.css`; merge classes with `cn` from `@agentos/ui/lib/utils`.
- Shell (`packages/core/src/shell/`), builtins, and extension `ui/*.tsx` all follow this rule so the product stays visually consistent.

## Vocabulary (prefer exact terms)

- **Extension** — feature unit under `extensions/` or `builtins/`
- **Service** — Python process under `services/`
- **API** — Bun file-based routes under `extensions/<id>/api`
- **Builtin** — platform extension, not toggleable
- **Shell / Gateway** — host only; no domain CRUD

## Runtime

- **pnpm** = install / workspaces
- **Bun** = run all TS/JS
- See `.project/docs/adr/001-pnpm-bun-hybrid.md`

## Comlink

Dual MessageChannel per iframe — see ADR 005. Do not “simplify” to shared `windowEndpoint`.

## When implementing

- Prefer conventions (`ui/`, `agent/`, `api/routes`) over manual registries.
- Builtins stay locked; only customer extensions toggle.
- If a ticket conflicts with an ADR, flag it — do not silently violate ADRs.
- **File names:** kebab-case (`activity-bar.tsx`, `host-client.test.ts`). Exported types/components remain PascalCase/camelCase.
- **Module folders:** `index.ts` barrel + `lib/` (implementation) + `tests/` + `components/` when UI is present (`shell/`, `sdk/`, `api/`, `@agentos/ui`, etc.).

## Output expectations

When answering architecture questions or planning work, cite the concept names above and point to the doc path (e.g. `.project/docs/concepts.md`). Do not invent parallel metaphors (“micro-frontend package”, “Next API folder”) that blur extension vs service.
