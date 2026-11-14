# 10 — Vite plugin + filesystem scanner

**Status:** in-progress

## Goal

Implement `agentos()` Vite plugin that watches `extensions/` and `packages/core/builtins/`, emitting a registry model on change.

## Done when

- [x] `@agentos/core/vite` exports `agentos()`
- [x] Discovers `ui/*`, `agent/*`, `api/routes`, `meta.json`, and Python `services/` links
- [x] HMR / watch invalidates registry when files are added/removed

## Notes

Consumer `examples/client-app/vite.config.ts` should use the plugin.
