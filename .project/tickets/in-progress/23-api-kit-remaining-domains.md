# 23 — Remaining `@agentos/core/api/*` domains

**Status:** in-progress

## Goal

Ship `/ai`, `/hitl`, `/events`, `/files`, `/secrets`, `/hooks`, `/logging`, `/config`, `/http`, `/errors`, `/telemetry`, `/tools`.

## Done when

- [x] Each subpath export resolves
- [x] Clients hit matching builtins where applicable
- [x] Hooks registry supports onStart/onRequest/onError/etc.

## Notes

Thin but real implementations preferred over empty barrels.
