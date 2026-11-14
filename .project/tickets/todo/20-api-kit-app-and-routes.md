# 20 — `@agentos/core/api` app factory + file-based `loadRoutes`

**Status:** todo

## Goal
Node BFF kit: `createApp`, `loadRoutes` scanning `api/routes/**/index.ts` (`[param]` → `:param`).

## Done when
- [ ] Route modules export HTTP method handlers (+ optional middleware)
- [ ] Health route convention works
- [ ] Documented under concepts: Node API lives in `extensions/<id>/api`

## Notes
This is what customer Node extensions use instead of hand-rolled servers.
