# Cookbook — Create a client app

Scaffold a new AgentOS **consumer app** from repo-root [`templates/`](../../../templates/).

## Command

```bash
# From the monorepo root (recommended destination: examples/)
bun packages/core/bin/agentos create examples/my-app --template minimal
# or, if agentos is on PATH via workspace:
agentos create examples/my-app --template minimal
```

| Flag         | Meaning                                                                                        |
| ------------ | ---------------------------------------------------------------------------------------------- |
| `<dir>`      | New folder name/path (e.g. `examples/my-app`). Package `name` becomes the basename (`my-app`). |
| `--template` | `minimal` (default), `with-extension`, or `with-service`                                       |

Fails if the target directory already exists.

## Templates

| Id               | What you get                                                  |
| ---------------- | ------------------------------------------------------------- |
| `minimal`        | Shell host, empty `extensions/`                               |
| `with-extension` | + stub Bun extension `starter` (port 6110)                    |
| `with-service`   | + extension UI + in-app Python `services/starter` (port 6111) |

`examples/client-app` remains the kitchen-sink **demo** — do not clone it for new apps.

## After create

v1 apps use `workspace:*` for `@agentos/core` / `@agentos/ui`. Create under `examples/` (already in `pnpm-workspace.yaml`) or add the path to the workspace.

```bash
pnpm install
cd examples/my-app
agentos dev
```

For `with-service`, also `uv sync` inside `services/starter` (see that template’s README). Outside-monorepo create / published npm packages are not supported yet.

## Next

- [Add a Bun/TS extension](./add-extension.md)
- [Concepts](../concepts.md) — app vs extension vs service
