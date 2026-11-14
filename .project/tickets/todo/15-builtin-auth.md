# 15 — Builtin `auth` (Better Auth + RBAC)

**Status:** todo

## Goal
Ship driving builtin `auth` with Better Auth: sessions, sign-in, roles/permissions checks. No separate `rbac` builtin.

## Done when
- [ ] `/api/ext/auth/*` supports sign-in/session and permission check
- [ ] Optional sign-in UI widget/page
- [ ] Marked `driven: true`, locked in Extension Manager
- [ ] Persists users/roles via **db-store** (or temporary local store until ticket 16, then migrate)

## Notes
If db-store is not ready, use a minimal local store and switch in ticket 16.
