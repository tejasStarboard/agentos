# 19 — Supporting builtins (hitl, events, files, notifications, secrets, audit)

**Status:** done

## Goal

Ship default-on supporting builtins needed for HITL inbox, events, files, notifications, secrets, and audit logging.

## Done when

- [x] `hitl` — create/list/resolve approvals; Shell inbox wired
- [x] `events` — publish/subscribe HTTP (or SSE) API
- [x] `files` — put/get blob API (local disk OK for v1)
- [x] `notifications` — fan-out used by Shell toasts path if applicable
- [x] `secrets` — get secret by key from env/store
- [x] `audit` — append-only log via db-store
- [x] All marked non-toggleable or default-on per plan

## Notes

Can implement hitl first if time-boxed; others may be thin stubs with stable routes.
