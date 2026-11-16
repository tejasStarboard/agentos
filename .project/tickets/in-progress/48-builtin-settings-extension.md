# 48 — Builtin `settings` extension + Activity Bar entry

**Status:** in-progress

## Goal

Create a **builtin `settings`** extension and open it from the Shell **Activity Bar secondary** gear (`setActiveView('settings')` → page iframe). Topbar does **not** host a Settings control.

## Depends on

- Ticket **47** (topbar chrome; Settings control removed — entry is Activity Bar)
- Ticket **15** / **43** (auth account remains separate; settings is product/app preferences, not only session)
- Ticket **38** (Activity Bar sections)

## Done when

- [x] `packages/core/builtins/settings/` exists (`meta.json`, optional `ui/page.tsx`, API stub if needed)
- [x] Marked builtin (`kind: builtin`, locked / non-toggleable as appropriate for platform settings)
- [x] Activity Bar secondary gear opens settings page (`ui/page.tsx` / `/__agentos/ext/settings/page.html`)
- [x] Example registry discovers settings; Extension Manager shows it locked if driven/locked
- [x] Docs: `builtins.md` row for **settings**
- [x] Tests: builtin scan; `GearSix` resolves in extension icon map

## Notes

- **Auth** secondary Activity Bar entry stays **account** (session / roles / security / sign-out — see ticket **50** for a proper panel). **Settings** is broader app/platform preferences (theme, branding readouts, extension prefs later).
- Prefer minimal v1 page (“Settings” shell with placeholders) over a full preferences product.
- Reuse `@agentos/ui`; no second design system.
- If settings is page-iframe based, follow existing `/__agentos/ext/settings/page.html` conventions.
- `meta.json` `"icon": "GearSix"` must be registered in `EXTENSION_ICON_MAP` (otherwise Cube fallback).

## Verify

- `agentos dev` → click Activity Bar settings gear → settings surface opens
- `bun test` builtin scan + `resolveExtensionIcon('GearSix')`
