# 19 — Supporting builtins (hitl, events, files, notifications, secrets, audit)

**Status:** todo

## Goal

Ship default-on supporting builtins needed for HITL inbox, events, files, notifications, secrets, and audit logging.

## Done when

- [ ] `hitl` — create/list/resolve approvals; Shell inbox wired
- [ ] `events` — publish/subscribe HTTP (or SSE) API
- [ ] `files` — put/get blob API (local disk OK for v1)
- [ ] `notifications` — fan-out used by Shell toasts path if applicable
- [ ] `secrets` — get secret by key from env/store
- [ ] `audit` — append-only log via db-store
- [ ] All marked non-toggleable or default-on per plan

## Notes

Can implement hitl first if time-boxed; others may be thin stubs with stable routes.
