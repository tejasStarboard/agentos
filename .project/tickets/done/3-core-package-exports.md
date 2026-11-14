# 3 — Define `@agentos/core` package exports

**Status:** done

## Goal

Wire `package.json` exports and source folders for parent modules: root, `/client`, `/api`, `/vite`, `/sdk`, and `bin/agentos` stub.

## Done when

- [x] Exports map exists for `.`, `./client`, `./api`, `./api/*`, `./vite`, `./sdk`
- [x] Source dirs exist under `packages/core/src/{cli,vite,sdk,client,shell,agent,api}` and `builtins/`
- [x] Stub entry files compile or at least resolve for TypeScript project references

## Notes

Domain `/api/auth` includes RBAC (no separate `/api/rbac`).
