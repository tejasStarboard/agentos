# 10 — Vite plugin + filesystem scanner

**Status:** todo

## Goal
Implement `agentos()` Vite plugin that watches `extensions/` and `packages/core/builtins/`, emitting a registry model on change.

## Done when
- [ ] `@agentos/core/vite` exports `agentos()`
- [ ] Discovers `ui/*`, `agent/*`, `api/routes`, `meta.json`, and Python `services/` links
- [ ] HMR / watch invalidates registry when files are added/removed

## Notes
Consumer `examples/client-app/vite.config.ts` should use the plugin.
