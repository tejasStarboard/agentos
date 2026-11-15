# 38 — Activity Bar primary + secondary sections

**Status:** in-progress

## Goal

Split the Shell Activity Bar into two vertical sections:

1. **Primary** (top) — icon items listed **top → bottom**, same as today’s customer-facing list (Home + page contributions from extensions such as `demo` / `crm-helper`).
2. **Secondary** (bottom) — icon items anchored at the **bottom end** of the bar and listed **bottom → top** (stack upward from the bar’s lower edge).

Only **builtin** extensions may register items into the secondary section. Customer / sample extensions may register only into the primary section (current demo-style page contributions).

## Depends on

- Tickets 5–8 (Shell skeleton + Extension Manager) — done
- Ticket **34** recommended first if icon wiring lands in the same chrome path (optional; layout can ship with existing icons)

## Done when

- [x] Activity Bar layout has distinct **primary** and **secondary** regions (primary fills from the top; secondary pinned to the bottom)
- [x] Primary items render top-to-bottom; secondary items render bottom-to-top from the bottom end (visual order: first secondary registration closest to the bottom edge, or document the chosen stack order in Notes and tests)
- [x] Builtin **auth** and **Approvals** (HITL) live in **secondary**, not in the primary list
- [x] Customer extension page contributions (e.g. `demo`) continue to appear only in **primary**
- [x] Registration / contribution API (or `meta` field) accepts a section hint; **non-builtin** attempts to target secondary are ignored or rejected (with a clear rule documented)
- [x] Builtins can opt into secondary (and may still use primary when appropriate, e.g. a future builtin page); auth + Approvals are the initial secondary registrants
- [x] Docs: Shell / extensions docs describe primary vs secondary Activity Bar space and the builtin-only rule
- [x] Unit/tests cover split layout regions, auth + Approvals in secondary, primary-only customer contributions, and rejection of customer secondary

## Notes

**Today:** `packages/core/src/shell/components/activity-bar.tsx` builds one flat list: `FIXED_ITEMS` (Home) → enabled page extensions → hardcoded `HITL_ITEM` → `MANAGER_ITEM`. There is no section model; bottom chrome is just appended. Auth has no dedicated Activity Bar entry yet (or would land with other page contributions in the primary list).

**Secondary builtins (required for this ticket):**

- **auth** — move / register into secondary
- **Approvals** (HITL) — move from the flat list into secondary

Other bottom chrome (e.g. Extensions manager) may stay secondary shell chrome if it remains; the required secondary _builtin_ items are auth + Approvals.

**Intent:**

```text
┌────────────┐
│  Home      │  ← primary (top → bottom)
│  demo      │
│  crm-…     │
│            │
│     ·      │  ← flexible gap
│            │
│  Auth      │  ← secondary (bottom → top from bottom end)
│  Approvals │
└────────────┘
```

Prefer a small explicit contribution field (e.g. `activityBarSection: 'primary' | 'secondary'`) over hardcoding every builtin id in the Activity Bar component. Enforce “secondary = builtins only” in the Shell apply/registry path so customer `meta` cannot claim that space.

UI primitives stay on `@agentos/ui` (`Button`, `Tooltip`, …); file remains kebab-case `activity-bar.tsx`.
