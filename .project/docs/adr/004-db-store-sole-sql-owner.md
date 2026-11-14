# ADR 004 — db-store is the sole SQL owner

## Status

Accepted

## Context

If every extension BFF opens Drizzle/SQL, we lose central policy, migrations, and security review surface.

## Decision

- Only builtin **`db-store`** holds DB credentials and runs Drizzle.
- All other code uses `@agentos/core/api/store` / `agentos.store` HTTP clients.
- Same pattern for **`cache-store`**.

## Consequences

- Slightly higher latency per query (HTTP hop) — acceptable for v1 clarity.
- Customer extensions must never set `DATABASE_URL` for app data access.
