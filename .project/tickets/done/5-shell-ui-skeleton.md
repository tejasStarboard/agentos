# 5 — Shell UI skeleton

**Status:** done

## Goal

Build dark-mode Core Shell layout: activity bar, sidebar slot, main canvas, home dashboard area, status bar chrome (empty slots OK).

## Done when

- [x] `mountShell(root)` renders the workspace
- [x] Slots exist for sidebar / main / widgets / hidden iframes
- [x] Basic Zustand store for UI state (active view, drawers open)

## Covered in this PR

- **Shell chrome** — activity bar, sidebar / main / widgets / hidden slots, status bar; placeholders only (no extension iframes yet)
- **`@agentos/ui`** — shadcn + Tailwind package wired into Shell; agent docs/rules require shadcn for base controls
- **Theming** — `next-themes` `ThemeProvider` (default dark); temporary status-bar light/dark switch; FOUC script in client-app
- **Structure** — kebab-case files; `shell/{components,lib,tests}`; same `lib`/`tests` layout for `sdk`, `api`, `client`, `cli`, `vite`, `agent`
- **Consumer** — `examples/client-app` Vite + `mountShell` smoke host
- **Tooling** — root `bun run ci` via Turbo (lint, format:check, typecheck, build, test); CSS ambient types for `@agentos/ui/globals.css`

## Notes

Reconciled to **done** (authorized when starting ticket 6).

**PR:** https://github.com/tejasStarboard/agentos/pull/4
