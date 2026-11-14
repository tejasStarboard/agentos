# 8 — Extension Manager drawer

**Status:** in-progress

## Goal

List extensions; toggle customer extensions ON/OFF; show builtins as locked/always-on.

## Done when

- [x] Customer disable unmounts iframes and clears contributed skills from palette state
- [x] Builtins (`auth`, `db-store`, `cache-store`, `ai`, …) cannot be toggled off
- [x] Status: active / disabled / crashed / loading

## Notes

Server-side unregister lands with gateway tickets; UI should already call enable API when available.
