# 45 — Organize Shell `components` / `hooks` / `lib` by feature

**Status:** done

## Goal

Restructure [`packages/core/src/shell/`](../../../packages/core/src/shell/) so files group **by feature**, not a flat dump:

```text
shell/
  components/
    auth/           # gate, login/register/reset, auth-form-card, …
    ui-contribs/    # sidebar-slot, status-bar, (future topbar), frames, …
    chrome/         # activity-bar, shell-root, command-palette, chat, …
    home/           # home-dashboard, …
  hooks/
    auth/           # if any
    ui-contribs/
    …
  lib/
    auth/           # auth-api, auth-routes
    ui-contribs/    # contribution, extension-runtime, …
    …
  mount.tsx
  index.ts
```

Exact folder names can be adjusted, but **auth** and **ui-contribs** (active-extension vs global contrib hosts) must be clear.

## Depends on

- Ticket **43** auth gate files exist (move, don’t rewrite behavior)
- Prefer **before** tickets **46–48** so new topbar/settings/sidebar work lands in the new layout

## Done when

- [x] Shell source moved into feature folders; barrels (`components/index.ts`, `lib/index.ts`, `hooks/index.ts`) updated
- [x] Public import paths (`@agentos/core/shell`, `@agentos/core/shell/components`, `@agentos/core/shell/lib`) still work
- [x] File names remain **kebab-case**
- [x] Tests + docs import paths updated; `bun test` shell suites green
- [x] No behavior change (pure organize)

## Notes

- Avoid deep `@agentos/core/shell/components/auth/login-page` package exports unless already supported — prefer barrel re-exports.
- Keep module rule: `index.ts` + `lib/` + `tests/` (+ `components/` for React).

## Verify

- `bun test` packages/core/src/shell
- `pnpm --filter @agentos/core run typecheck`
