# 3 — Define `@agentos/core` package exports

**Status:** todo

## Goal
Wire `package.json` exports and source folders for parent modules: root, `/client`, `/api`, `/vite`, `/sdk`, and `bin/agentos` stub.

## Done when
- [ ] Exports map exists for `.`, `./client`, `./api`, `./api/*`, `./vite`, `./sdk`
- [ ] Source dirs exist under `packages/core/src/{cli,vite,sdk,client,shell,agent,api}` and `builtins/`
- [ ] Stub entry files compile or at least resolve for TypeScript project references

## Notes
Domain `/api/auth` includes RBAC (no separate `/api/rbac`).
