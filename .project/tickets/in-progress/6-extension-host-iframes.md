# 6 — Extension host (iframe lifecycle)

**Status:** in-progress

## Goal

Mount sandboxed iframes per UI contribution, wire Comlink host API, crash/timeout containment, destroy on unmount.

## Done when

- [x] `sandbox="allow-scripts allow-same-origin"` iframes mount into correct slots
- [x] Handshake completes; `onActivate` / `onDeactivate` called
- [x] Crashed extension marked without killing Shell siblings

## Notes

Depends on ticket 4.
