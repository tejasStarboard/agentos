# 12 — Virtual iframe entries for UI files

**Status:** in-progress

## Goal

Serve `/__agentos/ext/<id>/<view>.html` entries that boot `createExtensionClient` + mount `page|sidebar|widget.tsx`.

## Done when

- [x] FDE writes only the view file; no per-extension Vite app
- [x] Theme/query params passed into iframe
- [x] Works for builtins and customer extensions

## Notes

True convention-over-config DX for UI.
