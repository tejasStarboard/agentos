# ADR 002 — Better Auth owns auth + RBAC

## Status

Accepted

## Context

Auth and RBAC are tightly coupled. Splitting builtins or kit paths (`/api/auth` vs `/api/rbac`) confuses FDEs and duplicates session/role sources of truth.

## Decision

- Single builtin **`auth`** using **Better Auth**, including roles/permissions.
- Single kit entry **`@agentos/core/api/auth`** exporting session middleware and `requireRoles` / `requirePermissions`.
- No separate `rbac` builtin or `@agentos/core/api/rbac`.

## Consequences

- Permission checks may call builtin `auth` APIs (optionally cached via `cache-store`).
- Role tables may still be persisted through `db-store`; Better Auth remains the identity/session authority.
