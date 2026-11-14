# 16 — Builtin `db-store` (Drizzle)

**Status:** todo

## Goal

Sole SQL owner: Drizzle-backed HTTP API for query/insert/update/delete. Only this process holds `DATABASE_URL`.

## Done when

- [ ] Collection/table-style API over HTTP
- [ ] SQLite default; Postgres via env optional
- [ ] Other packages must not import Drizzle drivers for app data
- [ ] Health endpoint OK

## Notes

Hard boundary: customer APIs/services use store **clients** only.
