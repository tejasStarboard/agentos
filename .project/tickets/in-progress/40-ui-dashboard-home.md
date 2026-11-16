# 40 — App-level `ui/dashboard.tsx` Home surface

**Status:** in-progress

## Goal

Ship **`ui/dashboard.tsx` at the consumer app root** (sibling of `extensions/` and `services/`) as the Shell **Home** entrypoint.

Wire it through `mountShell(root, { dashboard })` so Home renders the app’s own React page **in-process** — replacing the old hardcoded Shell Card (“Widgets / Widgets slot — extension cards land here later.”).

## Correct model (do not regress)

| Surface                           | Where it lives                                 | How it loads                               |
| --------------------------------- | ---------------------------------------------- | ------------------------------------------ |
| **Home dashboard**                | App `ui/dashboard.tsx`                         | In-process via `mountShell({ dashboard })` |
| Extension page / sidebar / widget | `extensions/<id>/ui/{page,sidebar,widget}.tsx` | Sandboxed iframes                          |

**Wrong approach (reverted):** treating `dashboard` as a fourth extension `UiViewName` / scanning `extensions/*/ui/dashboard.tsx` / serving `/__agentos/ext/<id>/dashboard.html`. Dashboard is **app chrome content**, not an extension contribution.

## Depends on

- Tickets **5** / **6** (Shell home pane, iframe host) — done
- Ticket **39** (contextual sidebar) — recommended; do not block

## Done when

- [x] Consumer app ships `ui/dashboard.tsx` next to `extensions/` and `services/`
- [x] `main.tsx` imports it and passes `mountShell(root, { dashboard })`
- [x] `HomeDashboard` / `ShellRoot` render that component in-process on `activeView === 'home'`
- [x] Hardcoded Widgets marketing Card removed
- [x] Extension `ui/widget.tsx` cards still work when present (grid below the app dashboard)
- [x] `dashboard` is **not** in `UiViewName` / `ExtensionView` / scanner / html-entry regexes
- [x] Docs (`concepts`, `extensions`, `architecture`, `packages`, cookbook) describe app-level dashboard vs extension widgets
- [x] Tests: Home renders passed dashboard; empty state has no “Widgets slot” copy; widgets still mount

## Notes

**App layout:**

```text
examples/client-app/
  ui/
    dashboard.tsx      # Home surface (app-owned)
  extensions/<id>/
    ui/page.tsx
    ui/sidebar.tsx
    ui/widget.tsx      # optional Home cards only
  services/<id>/
  src/main.tsx         # mountShell(root, { dashboard: Dashboard })
```

**Host behavior:**

```text
activeView === 'home'
  └─ HomeDashboard
       ├─ primary: app dashboard component (in-process)
       └─ optional: enabled extension ui/widget.tsx iframe cards
```

**Key paths:** `packages/core/src/shell/mount.tsx`, `packages/core/src/shell/components/{shell-root,home-dashboard}.tsx`, `examples/client-app/ui/dashboard.tsx`, `examples/client-app/src/main.tsx`, `.project/docs/{concepts,extensions,architecture,packages}.md`.

UI primitives stay on `@agentos/ui`. App dashboard may use `@agentos/ui` freely; it is not an extension iframe, so `@agentos/core/client` is not required.

## Covered in this PR

- **App Home** — `examples/client-app/ui/dashboard.tsx` + `mountShell({ dashboard })`; `HomeDashboard` renders in-process (no extension `dashboard` view / iframe scan)
- **Widgets** — optional extension `ui/widget.tsx` cards still mount under the app dashboard; demo sample widget included
- **Docs** — concepts / extensions / architecture / packages / cookbook distinguish app dashboard vs extension widgets
- **Shell polish (same PR)** — Activity Bar persists last selection (`agentos-shell-activity`); Extension Manager search + builtin filter (hidden by default); resizable sidebar/main split via `@agentos/ui` `ResizablePanelGroup`
