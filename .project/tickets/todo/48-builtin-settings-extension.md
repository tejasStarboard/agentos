# 48 — Builtin `settings` extension + topbar Settings action

**Status:** todo

## Goal

Create a **builtin `settings`** extension and wire the Shell **topbar Settings** control so clicking it **opens the settings extension** (page / Shell panel — pick one consistent with Activity Bar + sidebar patterns and document it).

## Depends on

- Ticket **47** (topbar Settings button)
- Ticket **15** / **43** (auth account remains separate; settings is product/app preferences, not only session)
- Ticket **38** (Activity Bar sections) if settings also gets a secondary entry — optional

## Done when

- [ ] `packages/core/builtins/settings/` exists (`meta.json`, optional `ui/page.tsx`, API stub if needed)
- [ ] Marked builtin (`kind: builtin`, locked / non-toggleable as appropriate for platform settings)
- [ ] Topbar Settings button opens settings UI (active view → settings page, **or** dedicated sidebar/shell panel — document choice)
- [ ] Example registry discovers settings; Extension Manager shows it locked if driven/locked
- [ ] Docs: `builtins.md` row for **settings**
- [ ] Tests: builtin scan; topbar click → settings surface visible

## Notes

- **Auth** secondary Activity Bar entry stays **account** (session / roles / security / sign-out — see ticket **50** for a proper panel). **Settings** is broader app/platform preferences (theme, branding readouts, extension prefs later).
- Prefer minimal v1 page (“Settings” shell with placeholders) over a full preferences product.
- Reuse `@agentos/ui`; no second design system.
- If settings is page-iframe based, follow existing `/__agentos/ext/settings/page.html` conventions.

## Verify

- `agentos dev` → click topbar Settings → settings surface opens
- `bun test` builtin scan + shell topbar interaction
