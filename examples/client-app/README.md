# `@agentos/client-app`

Sample AgentOS **consumer app**: mounts the Shell, ships demo extensions, and links the Python `invoice-bot` service.

## Layout

```text
examples/client-app/
  ui/dashboard.tsx          # App Home (in-process via mountShell)
  extensions/               # crm-helper, invoice-bot, demo, …
  services/ → ../../services/
  src/main.tsx              # mountShell(root, { dashboard })
```

## Run

From the **repo root**:

```bash
pnpm install
bun run dev
```

That starts Vite, builtin BFFs, and sample services via `agentos dev`.

## Docs

- [Concepts](../../.project/docs/concepts.md) — extension vs service vs packages
- [Extensions](../../.project/docs/extensions.md)
- [Services](../../.project/docs/services.md)
- [Cookbook: add extension](../../.project/docs/cookbook/add-extension.md)
