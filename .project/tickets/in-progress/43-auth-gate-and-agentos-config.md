# 43 — Auth gate routes + `agentos.config.ts`

**Status:** in-progress

## Goal

Move public auth (sign-in / sign-up / password reset) out of the Auth extension iframe and onto **framework-owned** in-process routes that **gate the Shell**:

- `http://localhost:5173/login`
- `http://localhost:5173/register`
- `http://localhost:5173/forgot-password`
- `http://localhost:5173/reset-password`

Ship a consumer-root **`agentos.config.ts`** so FDEs can predefine builtin / app settings (auth flags first).

Keep the Auth Activity Bar **secondary** entry as an **account settings** panel (session / roles / sign-out).

## Depends on

- Ticket **15** (builtin auth) — done
- Ticket **40** (in-process Home via `mountShell`) — done
- Ticket **10** / **11** (Vite plugin + virtual registry) — done

## Done when

- [x] `@agentos/core/config` exports `defineConfig` + `AgentosConfig` types
- [x] Consumer `agentos.config.ts` loaded by Vite plugin; runtime subset via `virtual:agentos-config`
- [x] `mountShell` gates workspace: public auth paths render outside Shell chrome; other paths require session or redirect to `/login`
- [x] Auth API supports `POST /sign-up`, `/forgot-password`, `/reset-password` (dev reset URL logged when no mailer)
- [x] `builtins/auth/ui/page.tsx` is account settings (not public sign-in)
- [x] Example + templates ship `agentos.config.ts`
- [x] Docs updated (`builtins`, `packages`, concepts/cookbook as needed)
- [x] Tests: config virtual module, auth API, AuthGate redirect / public pages

## Notes

- Secrets stay in `src/env.ts` / `createEnv` — not in `agentos.config.ts`.
- Public pages use same-origin `fetch('/api/ext/auth/…', { credentials: 'include' })` — no Comlink.
- UI controls from `@agentos/ui`.
- Minimal pathname routing (no new router dependency).

## Verify

- `bun test` for shell / auth / vite suites touched
- `agentos dev` → `/login` → sign in → Shell; Auth secondary = account; sign out → gate
