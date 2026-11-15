# 39 — Contextual sidebar + Shell panels left

**Status:** todo

## Goal

1. **Contextual extension sidebars** — show at most the active extension’s `ui/sidebar.tsx` (match `activeView === extensionId`), not a stack of every enabled sidebar.
2. **Shell panels in left sidebar** — render Extension Manager and HITL Approvals **inside** the left sidebar column instead of right `Sheet`s. Activity Bar secondary items keep opening those UIs; they occupy the sidebar host instead of overlaying the right edge.

Today contacts appear on every page because `SidebarSlot` mounts all `view: 'sidebar'` contributions globally (CRM Helper is the only sample with a sidebar). Right sheets are Shell-only (`ExtensionManagerDrawer`, `HitlInbox`).

## Depends on

- Tickets **5** / **8** (Shell skeleton + Extension Manager) — done
- Ticket **38** (primary/secondary Activity Bar) — keep Approvals / Extensions as secondary triggers that now drive left sidebar panel mode
- Tickets **34** / **35** recommended for sidebar-only extensions (e.g. CRM Helper) to be selectable in the Activity Bar so their sidebar can enter contribution mode

## Done when

- [ ] `SidebarSlot` shows only the sidebar contribution for `activeView` when in contribution mode; Home / no sidebar → empty placeholder (not CRM contacts on every page)
- [ ] Opening Extensions or Approvals from the Activity Bar shows that Shell UI in the **left** sidebar (sidebar forced open); right `Sheet` wrappers removed or unused for these two
- [ ] Contribution mode and Shell-panel mode are mutually exclusive (one host content at a time)
- [ ] `hitl.requestApproval` / existing open flags still surface the HITL UI (now left sidebar)
- [ ] Docs (`extensions.md` / architecture) note: sidebars are per active extension; manager + HITL are Shell sidebar panels
- [ ] Tests: contextual filter; manager/HITL render in sidebar slot; no right-sheet open for those flows

## Notes

**Layout host:**

```text
ActivityBar | SidebarSlot (one host) | Main
              ├─ contribution: active ext ui/sidebar.tsx
              ├─ extensions:  Extension Manager body
              └─ hitl:        Approvals body
```

**Shell mode:** Prefer a small mode (derive from existing `drawerOpen` / `hitlInboxOpen`, or a single `sidebarPanel: 'contribution' | 'extensions' | 'hitl'`) over keeping parallel right overlays. Reuse existing manager/HITL React bodies; strip `Sheet` chrome and mount them in `SidebarSlot` when that mode is active.

**Out of scope:** New extension-owned right-panel / sheet slot; chat overlay changes.

**Key paths:** `packages/core/src/shell/components/sidebar-slot.tsx`, `extension-manager-drawer.tsx`, `hitl-inbox.tsx`, `shell-root.tsx`, `activity-bar.tsx`, `store.ts`.

UI primitives stay on `@agentos/ui`; source files remain kebab-case.
