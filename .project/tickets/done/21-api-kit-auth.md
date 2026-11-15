# 21 — `@agentos/core/api/auth` (session + RBAC clients)

**Status:** done

## Goal

Domain kit talking to builtin `auth`: session middleware, `requireRoles`, `requirePermissions`.

## Done when

- [x] Protected routes return 401/403 correctly
- [x] No separate `@agentos/core/api/rbac` export
- [x] Python parity stub or full `agentos.auth` started (complete in ticket 24)

## Notes

Import path for FDEs: `@agentos/core/api/auth` only.
