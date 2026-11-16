# 8 — Extension Manager drawer

**Status:** done

## Goal

List extensions; toggle customer extensions ON/OFF; show builtins as locked/always-on.

## Done when

- [x] Customer disable unmounts iframes and clears contributed skills from palette state
- [x] Builtins (`auth`, `db-store`, `cache-store`, `ai`, …) cannot be toggled off
- [x] Status: active / disabled / crashed / loading

## Notes

Server-side unregister lands with gateway tickets; UI should already call enable API when available.

## Follow-up coverage (ticket 40 PR)

- Left-sidebar panel host (ticket 39) instead of right Sheet
- Search + filter menu (`builtin` unchecked by default hides platform builtins)
- List uses `@agentos/ui` `InputGroup` / `DropdownMenu` + `ScrollArea`
