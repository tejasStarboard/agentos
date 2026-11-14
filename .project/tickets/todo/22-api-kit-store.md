# 22 — `@agentos/core/api/store` (db + cache clients)

**Status:** todo

## Goal

`dbStore` and `cacheStore` HTTP clients to builtins — no direct Drizzle/Redis in the kit.

## Done when

- [ ] `dbStore.collection(...).query/insert/update/delete` works against db-store
- [ ] `cacheStore.get/set/del` works against cache-store
- [ ] Customer code cannot accidentally open DATABASE_URL through this package

## Notes

Hard platform rule.
