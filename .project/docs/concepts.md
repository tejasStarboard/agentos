# Concepts & boundaries

Short definitions so humans and agents never confuse **extension**, **service**, and **packages**.

## Glossary

| Term | What it is | Where it lives | What it is *not* |
|------|------------|----------------|------------------|
| **App / consumer** | Product that mounts the Shell and owns customer features | `examples/client-app/` | Not `@agentos/core` itself |
| **Shell** | Host UI: slots, iframes, Cmd+K, Extension Manager, chat/HITL chrome | `@agentos/core` `shell/`, via `mountShell()` | Not an extension; no domain business logic |
| **Gateway** | HTTP edge: registry, `/api/ext/:id/*` proxy, agent entrypoints | `@agentos/core/vite` middleware (v1) | Not domain CRUD |
| **Extension** | Feature unit: optional UI + agent decls + optional TS API routes | `extensions/<id>/` or `packages/core/builtins/<id>/` | Not the Python process |
| **Builtin extension** | Platform extension, always on, not toggleable | `packages/core/builtins/<id>/` | Not copied into customer `extensions/` to “enable auth” |
| **Customer extension** | Product feature (CRM, invoices, …), toggleable | `examples/.../extensions/<id>/` | Must not open DB/cache directly |
| **API (TS / Bun)** | File-based HTTP routes, run with **Bun** | `extensions/<id>/api/routes/**` | Not React UI; not Python; not run with Node |
| **Service** | Standalone **Python** backend process | `services/<id>/` | Not under `extensions/<id>/` |
| **BFF** | Informal name for API *or* service | Prefer saying **API** or **service** | — |
| **`@agentos/core`** | Framework: Shell, CLI, builtins, kits | `packages/core` | Not the customer app |
| **`@agentos/core/client`** | SDK for extension **UI** (iframes) | Import in `ui/*.tsx` | Never in `api/routes` or Python |
| **`@agentos/core/api/*`** | SDK for TS **API** routes | Import in `api/routes/**` | Never in iframe UI |
| **`@agentos/core/vite`** | Vite plugin + gateway | `vite.config.ts` | Not for route handlers |
| **`agentos` (Python)** | SDK for Python services | `services/<id>/` | Not a subpath of `@agentos/core` |
| **Agent folder** | tools / skills / instructions declarations | `extensions/<id>/agent/` | Runtime is builtin `ai` |
| **Tool** | Named HTTP-backed callable | Declared in `agent/`, implemented on API/service | Not an in-process Vite function |

## Mental model

```text
┌──────────────────────────── consumer app ────────────────────────────┐
│  mountShell()  ←── @agentos/core                                     │
│  vite.config   ←── @agentos/core/vite                                │
│                                                                      │
│  extensions/<id>/          ←── EXTENSION                             │
│    ui/*.tsx                ←── @agentos/core/client                  │
│    agent/*                 ←── declarations for builtin ai           │
│    api/routes/**           ←── @agentos/core/api/*  (Bun)            │
│    meta.json               ←── may point at a Service if Python      │
│                                                                      │
│  services/<id>/            ←── SERVICE (Python)                      │
│    app/                    ←── agentos.*                             │
└──────────────────────────────────────────────────────────────────────┘
         │  /api/ext/<id>/*
         ▼
┌──────────────────────────── @agentos/core ───────────────────────────┐
│  Shell + Gateway + builtins (auth, db-store, cache-store, ai, …)     │
└──────────────────────────────────────────────────────────────────────┘
```

## Rules of thumb

1. **UI** → `@agentos/core/client` only. Never `@agentos/core/api` in `ui/`.
2. **TS routes** → `@agentos/core/api/*` only. No `DATABASE_URL` / Redis — use `/api/store`.
3. **Python** → `agentos.*` in `services/` only, linked from `meta.json`.
4. **Auth/RBAC** → builtin `auth` + `@agentos/core/api/auth` (no second stack; no `/api/rbac`).
5. **SQL/cache** → `dbStore` / `cacheStore` → builtins only.
6. **TS backend** stays in the extension (`api/`). **Python backend** is a **service**.
7. **Builtins** locked; **customer** extensions toggleable.
8. **pnpm** installs the monorepo; **Bun** runs all TS/JS. Never Node for services.

## Prefer these words

| Say | Avoid |
|-----|--------|
| extension API / Bun API | “the Node BFF” |
| service | “Python extension folder” |
| builtin `auth` | “rbac package” as separate builtin |
| `db-store` | “give the CRM service a database URL” |
