# 6 — Extension host (iframe lifecycle)

**Status:** todo

## Goal

Mount sandboxed iframes per UI contribution, wire Comlink host API, crash/timeout containment, destroy on unmount.

## Done when

- [ ] `sandbox="allow-scripts allow-same-origin"` iframes mount into correct slots
- [ ] Handshake completes; `onActivate` / `onDeactivate` called
- [ ] Crashed extension marked without killing Shell siblings

## Notes

Depends on ticket 4.
