# `@agentos/ui`

Shared React UI primitives for AgentOS (shadcn + Tailwind + Phosphor icons). Used by Shell chrome, builtins, and extension UI so the product stays visually consistent.

## Install (workspace)

```json
{ "dependencies": { "@agentos/ui": "workspace:*" } }
```

## Usage

```ts
import { Button } from '@agentos/ui/components/button';
import { Input } from '@agentos/ui/components/input';
import '@agentos/ui/globals.css';
```

Import tokens/styles via `@agentos/ui/globals.css`. Merge classes with `cn` from `@agentos/ui/lib/utils`.

Do **not** use native `<button>` / `<input>` / `<select>` when an `@agentos/ui` primitive exists (see `AGENTS.md` and `.cursor/rules/agentos-ui.mdc`).

## Docs

- [`.project/docs/packages.md`](../../.project/docs/packages.md)
- [`.project/docs/concepts.md`](../../.project/docs/concepts.md)

## Develop

```bash
pnpm install
bun run --filter @agentos/ui typecheck
```
