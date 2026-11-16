# 47 — Shell topbar (UI contrib host + basic chrome)

**Status:** in-progress

## Goal

Add a **topbar** to the Shell, symmetric to the bottom **status bar**: a horizontal chrome strip that can host UI contributions later.

**v1 controls (required):**

| Placement | Control                                                                        |
| --------- | ------------------------------------------------------------------------------ |
| Left      | Toggle left sidebar open/closed                                                |
| Center    | App name / branding (from ticket **44** `branding`)                            |
| Right     | Settings button (**no domain action in this ticket** — wired in ticket **48**) |

## Depends on

- Ticket **44** (branding) — for centered app name / logo
- Ticket **45** (feature folders) — recommended; place under `components/ui-contribs` or `chrome`
- Ticket **46** (sidebar auto-hide) — recommended so toggle interacts cleanly with empty-sidebar policy

## Done when

- [x] `TopBar` (kebab-case file) rendered in `ShellRoot` above the workspace row
- [x] Left: sidebar toggle (uses existing `sidebarOpen` store)
- [x] Center: branding from `virtual:agentos-config` / mount options (`appName`, optional logo via `/_public/...`)
- [x] Right: Settings icon button present; click may be no-op or emit a stub store flag until ticket **48**
- [x] Slot/host shape documented for future UI contributions (mirror status-bar patterns where sensible)
- [x] UI from `@agentos/ui`; tests for layout presence + toggle behavior
- [x] Docs: architecture / extensions note topbar chrome

## Notes

- Topbar is **Shell chrome**, not an extension page.
- Settings **opens the settings extension** in ticket **48** — keep the button API stable (e.g. `data-slot="topbar-settings"`).
- Do not steal Activity Bar primary/secondary semantics; topbar is orthogonal.

## Verify

- `agentos dev` → topbar visible; toggle collapses/expands sidebar; branding shows configured name
- `bun test` shell suites
