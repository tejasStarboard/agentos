# 12 — Virtual iframe entries for UI files

**Status:** todo

## Goal

Serve `/__agentos/ext/<id>/<view>.html` entries that boot `createExtensionClient` + mount `page|sidebar|widget.tsx`.

## Done when

- [ ] FDE writes only the view file; no per-extension Vite app
- [ ] Theme/query params passed into iframe
- [ ] Works for builtins and customer extensions

## Notes

True convention-over-config DX for UI.
