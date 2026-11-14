# 16 — Builtin `db-store` (Drizzle)

**Status:** done

## Goal

Sole SQL owner: Drizzle-backed HTTP API for query/insert/update/delete. Only this process holds `DATABASE_URL`.

## Done when

- [x] Collection/table-style API over HTTP
- [x] SQLite default; Postgres via env optional
- [x] Other packages must not import Drizzle drivers for app data
- [x] Health endpoint OK

## Notes

Hard boundary: customer APIs/services use store **clients** only.
