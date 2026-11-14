---
name: agentos-ticket-planner
description: >-
  Plan implementation for AgentOS tickets in .project/tickets. Use when the user
  asks to plan, estimate, break down, or start a ticket (todo/in-progress), or
  when preparing a PR/work plan for numbered tickets 1–31.
---

# AgentOS ticket planner

## Before planning

1. Invoke / follow **agentos-architecture** (read `.project/docs/concepts.md`).
2. Open the ticket file under `.project/tickets/{todo|in-progress}/`.
3. Skim `.project/docs/roadmap.md` for phase context and dependencies (lower ticket numbers first).

## Planning checklist

Produce a short plan with:

1. **Goal** — restated from the ticket
2. **Depends on** — prior tickets that must be done
3. **Touches** — packages/paths (`packages/core/...`, `examples/...`, `services/...`)
4. **Boundaries** — which kit applies (`/client` vs `/api` vs Python `agentos`)
5. **ADR risks** — any temptation to violate ADRs 001–005
6. **Done when** — copy/adjust ticket checkboxes
7. **Verify** — commands using **pnpm** (install) and **bun** (run), not node

## Rules

- Do **not** start coding unless the user explicitly asks to implement/execute.
- Do **not** skip to a high-number ticket if lower blockers are open (call that out).
- Setup-only work (docs/skills) is ticket **31** / docs — already may be done; don’t rebuild the world.
- Prefer moving the ticket file `todo/` → `in-progress/` only when implementation starts.

## Template

```markdown
## Plan for ticket N — <title>

### Goal

…

### Dependencies

- Ticket …

### Files / packages

- …

### Boundary

- UI → /client | API → /api/* (Bun) | Python → services/ + agentos

### Risks / ADR

- …

### Implementation steps

1. …
2. …

### Verify

- pnpm …
- bun …
```
