# **APP_NAME**

AgentOS **consumer app** scaffolded with `agentos create` (`with-service` template).

## Layout

```text
ui/dashboard.tsx              # App Home (mountShell)
extensions/starter/           # Extension UI + meta → Python service
services/starter/             # Python FastAPI service (agentos SDK)
src/main.tsx                  # mountShell(root, { dashboard })
```

## Run (monorepo)

From the **repo root** (create under `examples/<name>` so `workspace:*` resolves):

```bash
pnpm install
cd examples/__APP_NAME__/services/starter && uv sync && cd -
cd examples/__APP_NAME__
agentos dev
```

Starter service port **6111** (proxied as `/api/ext/starter/*`).

`services/starter/pyproject.toml` points `agentos` at `../../../../packages/python` (valid when the app lives at `examples/<name>/`).

## Docs

- [Concepts](../../.project/docs/concepts.md)
- [Services](../../.project/docs/services.md)
- [Cookbook: create client app](../../.project/docs/cookbook/create-client-app.md)
