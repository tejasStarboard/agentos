# ADR 005 — Comlink over dual MessageChannel

## Status

Accepted

## Context

Multiple iframes sharing Comlink `windowEndpoint` caused host API cross-talk in the prior experiment. Expose+wrap on one port also collides message IDs.

## Decision

- Per-iframe **two MessageChannels**: HostAPI and ExtensionAPI.
- Handshake: READY → HOST_ACK (+ports) → PORT_READY → onActivate.
- Nested HostAPI objects marked with `Comlink.proxy` on the host.

## Consequences

- Slightly more handshake code in `@agentos/core/sdk` / client.
- Stable isolation between extensions.
