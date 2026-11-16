# __APP_NAME__

AgentOS **consumer app** scaffolded with `agentos create` (`minimal` template).

## Layout

```text
ui/dashboard.tsx    # App Home (mountShell)
extensions/         # Customer extensions (empty)
src/main.tsx        # mountShell(root, { dashboard })
```

## Run (monorepo)

From the **repo root** (app should live under `examples/<name>` or another `pnpm-workspace` path):

```bash
pnpm install
cd examples/__APP_NAME__   # or your create path
agentos dev
```

## Docs

- [Concepts](../../.project/docs/concepts.md)
- [Cookbook: create client app](../../.project/docs/cookbook/create-client-app.md)
- [Cookbook: add extension](../../.project/docs/cookbook/add-extension.md)
