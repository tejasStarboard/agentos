# 46 — Hide empty active-extension UI contrib hosts + Home `dashboard-sidebar`

**Status:** in-progress

## Goal

Distinguish UI contribution hosts:

| Host kind                                                              | Shows                                                                                  | When empty                                                                                   |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| **Active-extension** (e.g. left **sidebar**)                           | Only the **active** extension’s contribution (`ui/sidebar.tsx`, or Home’s app sidebar) | **Do not show** the host chrome / column — no empty black pane (see Home + Demo screenshots) |
| **Global / multi-extension** (e.g. **status bar**, future aggregators) | May aggregate **all** enabled extensions                                               | May stay visible with Shell chrome even if some extensions contribute nothing                |

Today `SidebarSlot` stays open with an empty column when Home or Demo has no sidebar registration — wasted space.

Also add app-level **`ui/dashboard-sidebar.tsx`** (sibling of `ui/dashboard.tsx`) as the **Home** sidebar entrypoint, passed through `mountShell` (in-process, like dashboard — **not** an extension iframe / not a new `UiViewName`).

## Depends on

- Ticket **39** (contextual sidebar) — done
- Ticket **40** (app `ui/dashboard.tsx`) — done
- Ticket **45** (feature folders) — recommended first so new files land under `ui-contribs` / `home`

## Done when

- [x] Model documents **active-extension** vs **global** UI contrib hosts
- [x] In contribution mode: if active view has **no** sidebar contribution (and Home has no `dashboardSidebar`), Shell **collapses/hides** the sidebar column (no empty pane). User can still open sidebar for Shell panels (manager / HITL) or when a sidebar exists
- [x] `ui/dashboard-sidebar.tsx` convention + `mountShell({ dashboardSidebar })` (name TBD but parallel to `dashboard`)
- [x] Home (`activeView === 'home'`) renders that component in the sidebar host when provided
- [x] Demo / extensions without `ui/sidebar.tsx` no longer leave an empty sidebar column
- [x] CRM Helper (has sidebar) still shows contextual sidebar when active
- [x] Docs + tests cover hide/show matrix; Home dashboard-sidebar render

## Notes

**Correct model (do not regress ticket 40):**

| Surface      | Where                            | How        |
| ------------ | -------------------------------- | ---------- |
| Home main    | `ui/dashboard.tsx`               | in-process |
| Home sidebar | `ui/dashboard-sidebar.tsx`       | in-process |
| Ext sidebar  | `extensions/<id>/ui/sidebar.tsx` | iframe     |

**Out of scope:** Changing status-bar aggregation semantics beyond documenting global vs active; topbar (ticket **47**).

**Key paths:** `shell-root.tsx`, `sidebar-slot.tsx`, store `sidebarOpen`, `mount.tsx`, `examples/client-app/ui/`.

## Verify

- Manual: Home + Demo → no empty sidebar column; CRM Helper → sidebar visible
- `bun test` shell sidebar / mount suites
