# 22 — `@agentos/core/api/store` (db + cache clients)

**Status:** in-progress

## Goal

`dbStore` and `cacheStore` HTTP clients to builtins — no direct Drizzle/Redis in the kit.

## Done when

- [x] `dbStore.collection(...).query/insert/update/delete` works against db-store
- [x] `cacheStore.get/set/del` works against cache-store
- [x] Customer code cannot accidentally open DATABASE_URL through this package

## Notes

Hard platform rule.
