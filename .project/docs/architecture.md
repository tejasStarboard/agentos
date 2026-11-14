# Architecture

AgentOS is a **convention-over-configuration** extension platform: an empty **Shell** host, **sandboxed UI iframes** (Comlink), and **per-feature HTTP backends** (Bun TS APIs or Python services), plus **driving builtins** for auth, data, cache, and AI.

## High-level

```text
Browser:  Shell (mountShell) + extension UI iframes
    │
    ├─ Comlink (MessageChannel per iframe) ── HostAPI
    │
    └─ HTTP ── Gateway (@agentos/core/vite middleware)
                  ├─ /api/agent/*  → control plane → builtin ai / hitl
                  └─ /api/ext/:id/* → proxy → Bun API or Python service
                                              │
                                              └─ clients → builtins
                                                   auth | db-store | cache-store | ai | …
```

## Comlink sandbox

- Each `ui/page.tsx` | `sidebar.tsx` | `widget.tsx` loads in `iframe sandbox="allow-scripts allow-same-origin allow-forms"`.
- Transport: **dual MessageChannel** per iframe (not shared `windowEndpoint` — avoids cross-talk).
- UI uses `@agentos/core/client` hooks; never raw `postMessage`.

## Gateway

- Discovers builtins + customer extensions via Vite scanner → `virtual:agentos-registry`.
- Proxies `/api/ext/:id/*` to upstream from `meta.json` (port, language `bun` | `python`).
- Disabled **customer** extensions → 403 + UI unmounted. **Builtins** cannot be disabled.

## Builtins (platform)

See [builtins.md](./builtins.md). Hard rules:

- Only **db-store** holds SQL credentials (Drizzle).
- Only **cache-store** owns cache.
- Only **auth** (Better Auth) owns identity + RBAC.

## Customer features

- **Extension** folder: `ui/`, `agent/`, optional `api/routes/` (Bun).
- **Service** folder: Python FastAPI under `services/<id>/` when `meta.api.language === "python"`.

## Runtime tooling

| Concern           | Tool                        |
| ----------------- | --------------------------- |
| Workspace install | **pnpm**                    |
| Run TS/JS         | **Bun** (`bun run`, `bunx`) |
| Python services   | **uv** / uvicorn            |
| Host UI build     | Vite (via Bun)              |

## Related ADRs

- [001 pnpm + Bun hybrid](./adr/001-pnpm-bun-hybrid.md)
- [002 Better Auth owns auth+RBAC](./adr/002-better-auth-auth-rbac.md)
- [003 Python services outside extensions](./adr/003-python-services-outside-extensions.md)
- [004 db-store sole SQL owner](./adr/004-db-store-sole-sql-owner.md)
- [005 Comlink MessageChannel](./adr/005-comlink-messagechannel.md)
- [006 Vercel AI SDK v7 owns platform AI](./adr/006-vercel-ai-sdk.md)
