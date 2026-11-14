# 4 — Comlink SDK (host + extension client)

**Status:** done

## Goal

Port MessageChannel-based Comlink handshake into `@agentos/core/sdk` (HostAPI / ExtensionAPI / createExtensionClient / timeouts).

## Done when

- [x] Dual MessageChannel handshake works (READY → HOST_ACK + ports → PORT_READY)
- [x] Nested HostAPI namespaces use `Comlink.proxy` where needed
- [x] RPC timeout helper exists
- [x] Types cover storage, notifications, ai, hitl, api.fetch, events

## Notes

Do not use shared `windowEndpoint` for multi-iframe (cross-talk).
