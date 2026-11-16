# AgentOS app templates

Source trees for `agentos create <dir> --template <id>`.

| Id                  | Description                                          |
| ------------------- | ---------------------------------------------------- |
| `minimal` (default) | Shell host only; empty `extensions/`                 |
| `with-extension`    | Same + stub Bun extension `starter`                  |
| `with-service`      | Stub extension UI + in-app Python `services/starter` |

These are **not** workspace packages. Copy them with the CLI; do not treat them as demos (`examples/client-app` stays the kitchen-sink sample).

**v1:** created apps expect monorepo `workspace:*` deps — create under `examples/<name>` (covered by `pnpm-workspace.yaml`) or add the path to the workspace.
