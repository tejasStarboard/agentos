# 42 — CLI package: scaffold a client app (`create` / `init`)

**Status:** in-progress

## Goal

Ship an AgentOS CLI entrypoint (same family as `agentos dev` / `build`) that **scaffolds a consumer client app** the way `create-react-app` or `shadcn init` does: one command copies a template from repo-root **`templates/`** into the user’s directory (renamed to the app name), producing a runnable Shell host wired to Vite + `@agentos/core` / `@agentos/ui`.

## Depends on

- **27** — CLI `agentos` bin + `dev` / `build` already exist under `@agentos/core`
- **2–3**, **5**, **10**, **40** — monorepo, core exports, Shell, Vite plugin, app-level `ui/dashboard.tsx` (templates must match current conventions)
- Prefer landing after **41** (metadata/README accuracy) so generated docs/scripts don’t copy stale copy

Does **not** require ticket **29** (E2E) or **30** (Next host spike).

## Done when

- [x] Repo-root **`templates/`** exists with **2–3** named starters (see Notes); each is a complete copyable consumer tree (not a slice of `examples/client-app`)
- [x] Documented command(s) create a new app dir from a template, e.g. `agentos create <name> --template minimal` (default template named; `init` into cwd optional)
- [x] CLI **copies** `templates/<id>/` → `<name>/`, then applies light transforms (`package.json` `name`, README title; deps `workspace:*` vs versioned when outside monorepo)
- [x] Every template includes at least: `package.json` (Bun / `agentos dev`), `vite.config.ts` (`@agentos/core/vite`), `index.html`, `src/main.tsx` (`mountShell`), `ui/dashboard.tsx`, `src/env.ts` (`createEnv` extends), `tsconfig`, Tailwind/`@agentos/ui`, `extensions/`
- [x] Default template has **no** demo domain apps (`crm-helper` / `invoice-bot` / `demo`); richer templates only add **stub** extension/service skeletons, not full samples
- [x] Post-scaffold instructions print clearly (install → `agentos dev`); template READMEs use concepts vocabulary (app / extension / service)
- [x] CLI lives in existing `@agentos/core` `bin` / `src/cli` — no parallel Node scaffolder
- [x] Tests: arg parsing + copy into temp dir; assert required files for each template id
- [x] Cookbook `.project/docs/cookbook/create-client-app.md` (+ pointer from docs index)

## Notes

**Product analogy**

| Tool                          | AgentOS equivalent                                              |
| ----------------------------- | --------------------------------------------------------------- |
| `npx create-react-app my-app` | Copy `templates/<id>` → user dir                                |
| `npx shadcn@latest init`      | (later) wire into existing project — out of scope for v1 create |

**Layout (source of truth)**

```text
templates/
  README.md                 # which template to pick
  minimal/                  # default — empty consumer
  with-extension/           # + one stub Bun extension
  with-service/             # + stub extension + stub Python service
```

**Proposed templates (lock at implement; drop to 2 if needed)**

| Id                  | What you get                                                                      |
| ------------------- | --------------------------------------------------------------------------------- |
| `minimal` (default) | Shell host only; empty `extensions/`                                              |
| `with-extension`    | Same + one stub Bun extension (`meta.json`, `ui/page.tsx`, `api/` stub)           |
| `with-service`      | Same as extension stub + `services/<id>/` Python skeleton linked from `meta.json` |

Do **not** use `examples/client-app` as the copy source — it stays the kitchen-sink demo. Templates stay lean; demos stay in `examples/`.

**Suggested UX**

- Primary: `agentos create <dir> [--template minimal|with-extension|with-service]`
- Optional: `agentos init [--template …]` — scaffold into cwd if empty / non-conflicting
- Flags: `--skip-install`, maybe `--name` when using `init`

**Packaging**

- Today `@agentos/core` is `private` + `workspace:*`. v1 may only support create **inside this monorepo** (or with local package paths) until packages are publishable — document that in CLI help + cookbook.
- When packaging the CLI for publish later, either ship `templates/` inside the package or resolve them relative to the repo root / package root via a single path helper.

**Boundaries / ADR**

- UI → `@agentos/core/client` + `@agentos/ui`; no native control defaults
- APIs → Bun + `@agentos/core/api/*`; no customer `DATABASE_URL`
- Auth → builtin `auth` only
- Runtime → **pnpm** install; **Bun** run — never Node for services
- Filenames → kebab-case

## Out of scope

- Next.js host adapter (ticket **30**)
- `agentos generate extension` (follow-up)
- Copying / cloning `examples/client-app` samples into templates
- Publishing `@agentos/*` to npm unless required for outside-monorepo create
- Reworking `dev` / `build` beyond registering `create` / `init`

## Verify

- `agentos create /tmp/agentos-smoke --template minimal` (and each other id) exits 0 with expected tree
- Smoke: install + `agentos dev` boots Shell for `minimal`
- `bun test` covers parse + scaffold copy
- `examples/client-app` unchanged as demo; no dual-purpose template drift

## Files / packages (likely)

- `templates/minimal/`, `templates/with-extension/`, `templates/with-service/`
- `templates/README.md`
- `packages/core/src/cli/` — `create` / `init`, template discovery + copy + rename transforms
- `packages/core/bin/agentos`
- `.project/docs/cookbook/create-client-app.md`
