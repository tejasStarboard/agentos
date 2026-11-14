# 13 — Gateway `/api/ext/:id` proxy

**Status:** todo

## Goal
Vite middleware reverse-proxies to each extension’s Node API or Python service upstream; blocks disabled customer extensions.

## Done when
- [ ] `ALL /api/ext/:id/*` forwards to configured port/basePath
- [ ] Auth session cookie/header propagated
- [ ] Disabled customer id → 403; builtins always proxied

## Notes
Upstream ports come from `meta.json` / scanner.
