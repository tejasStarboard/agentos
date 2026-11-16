# **APP_NAME**

AgentOS **consumer app** scaffolded with `agentos create` (`with-extension` template).

## Layout

```text
ui/dashboard.tsx              # App Home (mountShell)
extensions/starter/           # Stub Bun extension (UI + API)
src/main.tsx                  # mountShell(root, { dashboard })
```

## Run (monorepo)

From the **repo root** (app should live under `examples/<name>` or another `pnpm-workspace` path):

```bash
pnpm install
cd examples/__APP_NAME__   # or your create path
agentos dev
```

Starter API listens on port **6110** (proxied as `/api/ext/starter/*`).

## Docs

- [Concepts](../../.project/docs/concepts.md)
- [Cookbook: create client app](../../.project/docs/cookbook/create-client-app.md)
- [Cookbook: add extension](../../.project/docs/cookbook/add-extension.md)
