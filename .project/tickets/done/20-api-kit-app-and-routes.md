# 20 — `@agentos/core/api` app factory + file-based `loadRoutes`

**Status:** done

## Goal

Bun API kit: `createApp`, `loadRoutes` scanning `api/routes/**/index.ts` (`[param]` → `:param`).

## Done when

- [x] Route modules export HTTP method handlers (+ optional middleware)
- [x] Health route convention works
- [x] Documented under concepts: Bun API lives in `extensions/<id>/api`

## Notes

This is what customer Bun extensions use instead of hand-rolled servers (`createApp` + `loadRoutes`).
