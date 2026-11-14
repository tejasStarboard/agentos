# 7 — `@agentos/core/client` hooks

**Status:** in-progress

## Goal

Ship iframe SDK: HostProvider + `useHostStorage`, `useHostAI`, `useHostHITL`, `useHostNotifications`, `useHostApi`.

## Done when

- [x] UI code can call hooks without touching Comlink directly
- [x] Documented that `/client` is for `ui/*` only (not `api/routes`)

## Notes

Boundary: never import `/api` from UI.
