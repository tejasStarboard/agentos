# 17 — Builtin `cache-store`

**Status:** in-progress

## Goal

Sole cache owner: get/set/del/ttl HTTP API. In-memory for v1; same interface for Redis later.

## Done when

- [x] `/api/ext/cache-store/*` works
- [x] No direct Redis/memory cache in customer BFFs
- [x] Optional use from auth permission-check caching

## Notes

Mirror db-store access pattern.
