# 4 — Comlink SDK (host + extension client)

**Status:** todo

## Goal
Port MessageChannel-based Comlink handshake into `@agentos/core/sdk` (HostAPI / ExtensionAPI / createExtensionClient / timeouts).

## Done when
- [ ] Dual MessageChannel handshake works (READY → HOST_ACK + ports → PORT_READY)
- [ ] Nested HostAPI namespaces use `Comlink.proxy` where needed
- [ ] RPC timeout helper exists
- [ ] Types cover storage, notifications, ai, hitl, api.fetch, events

## Notes
Do not use shared `windowEndpoint` for multi-iframe (cross-talk).
