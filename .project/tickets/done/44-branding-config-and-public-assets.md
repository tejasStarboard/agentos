# 44 — Branding in `agentos.config.ts` + `/_public` assets

**Status:** done

## Goal

Extend consumer `agentos.config.ts` so FDEs can set **app branding** (name, logo, typography). Ship a consumer **`public/`** folder whose files are served at **`http://localhost:5173/_public/...`** (Vite gateway convention).

Update [`examples/client-app/agentos.config.ts`](../../../examples/client-app/agentos.config.ts) (and templates) with sample branding that points at `_public` assets.

## Depends on

- Ticket **43** (`agentos.config.ts` / `defineConfig` / `virtual:agentos-config`) — in-progress / prerequisite

## Done when

- [x] `AgentosConfig` includes a `branding` section, e.g. `appName`, `logoUrl`, `faviconUrl`, typography knobs (`fontSans` / `fontHeading` or CSS variable URLs)
- [x] Resolved branding flows through `virtual:agentos-config` for Shell / auth chrome
- [x] Consumer `public/` (default name; configurable if needed) is served at `/_public/<path>` in Vite plugin (dev + preview/build)
- [x] `examples/client-app` (and templates) ship `public/` + branding entries in `agentos.config.ts`
- [x] Docs: packages / cookbook note branding + `_public` vs secrets in `env.ts`
- [x] Tests: config resolve + virtual module; `/_public` middleware/asset serve

## Notes

- Logo paths should be `_public/...` URLs (or absolute https), not filesystem paths in the browser.
- Typography: prefer loading via config-driven CSS variables / `@font-face` from `_public` fonts — keep `@agentos/ui` tokens as the base.
- Do **not** put secrets in branding config.
- Ticket **47** (topbar) will consume branding for centered app name / logo.

## Verify

- `bun test` for config / vite suites
- `agentos dev` → open `/_public/<asset>` and confirm branding fields on `virtual:agentos-config`
