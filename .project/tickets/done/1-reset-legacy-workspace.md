# 1 — Reset legacy workspace

**Status:** done

## Goal
Remove the previous experiment (`@app/sdk`, `@app/shell`, `extensions/ext-*`) so AgentOS can be scaffolded cleanly.

## Done when
- [x] `packages/sdk`, `packages/shell`, and `extensions/ext-*` are deleted
- [x] Old root scripts/tsconfigs that reference them are cleared or replaced with stubs
- [x] Repo still has `.project/`, `.gitignore`, and can run a fresh `pnpm install` after the next ticket

## Notes
Keep `.project/` intact. Clean slate is intentional.
