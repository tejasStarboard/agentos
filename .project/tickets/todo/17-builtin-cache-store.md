# 17 — Builtin `cache-store`

**Status:** todo

## Goal

Sole cache owner: get/set/del/ttl HTTP API. In-memory for v1; same interface for Redis later.

## Done when

- [ ] `/api/ext/cache-store/*` works
- [ ] No direct Redis/memory cache in customer BFFs
- [ ] Optional use from auth permission-check caching

## Notes

Mirror db-store access pattern.
