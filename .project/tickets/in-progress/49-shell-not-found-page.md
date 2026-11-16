# 49 — Shell not-found (404) page

**Status:** in-progress

## Goal

Unknown browser paths currently fall through Vite’s SPA `index.html` and render the auth-gated Shell (or Home) as if the route were valid — e.g. `/__public/logo.svg` (typo) or `/this-does-not-exist`. Ship a framework **Not Found** surface so bad URLs show a clear 404 instead of the app.

Cover both:

1. **Client routes** unknown to the Shell / auth gate (after session check).
2. **Gateway static misses** where we already return HTTP 404 body today (`/_public/...` missing file) — optionally a small HTML 404 document instead of plain text, and ensure SPA fallback does not swallow reserved prefixes.

## Depends on

- Ticket **43** (auth gate + pathname handling) — done / in-progress
- Ticket **44** (`/_public` middleware) — related; missing assets already 404 at the gateway; this ticket owns the **UI** not-found page and SPA routing policy

## Done when

- [x] Unknown app pathnames (not public auth routes, not `/`, not known Shell deep-links if any) render a **Not Found** page outside or inside Shell chrome (pick one consistent pattern)
- [x] Page uses `@agentos/ui` + branding `appName` where sensible; primary CTA back to Home / login as appropriate
- [x] Reserved gateway prefixes (`/_public`, `/__agentos`, `/api`, …) are **not** claimed by the SPA shell as “app routes” when the middleware already answered (document behavior; fix if Vite SPA fallback interferes)
- [x] Missing `/_public/<file>` still returns HTTP 404; prefer a minimal HTML 404 body (or keep text 404) — document the contract
- [x] Tests: route matching / AuthGate (or router) shows not-found for unknown paths; gateway `/_public` miss stays 404
- [x] Docs: cookbook / architecture note SPA unknown → 404 vs gateway prefixes

## Notes

- Do **not** invent a full client router unless needed; AuthGate already keys off `pathname` — extend that allowlist / fallthrough.
- Wrong prefix like `/__public/...` is an **app** unknown path today (double underscore) → should hit the Not Found page, not Home.
- Correct asset URL remains `/_public/<path>` (single underscore).

## Verify

- `agentos dev` → `/_public/logo.svg` still 200; `/_public/missing.svg` → HTTP 404
- `/__public/logo.svg` and `/totally-missing` → Not Found UI (not Home / login workspace chrome as a fake success)
- `bun test` shell (+ vite if gateway HTML 404 changes)
