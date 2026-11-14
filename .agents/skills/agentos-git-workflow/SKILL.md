---
name: agentos-git-workflow
description: >-
  AgentOS git commits, PRs, and branch policy. Use when committing, opening a
  pull request, naming branches, or choosing feat/fix/chore for ticket work.
---

# AgentOS git workflow

## Branches

| Branch | Role |
|--------|------|
| **`dev`** | Primary integration branch (default). Open ticket PRs **into `dev`**. |
| **`main`** | Production. Do not land ticket work here directly. |

Never push commits straight to `dev` or `main`. Land changes only via pull requests.

## Commit title

Format (verbatim):

```text
[feat/fix/chore](<ticket number>): <commit title>
```

Examples:

```text
chore(1): reset legacy workspace
feat(2): scaffold monorepo
fix(16): correct db-store migration path
```

### Type picker

| Type | When |
|------|------|
| `feat` | New capability or scaffold that advances the platform |
| `fix` | Bug fix |
| `chore` | Cleanup, reset, tooling, docs/skills hygiene without product behavior |

Use the **ticket number** from `.project/tickets/` (e.g. `1`, `2`). One ticket per commit/PR when practical.

## Pull request

**Title** — same shape as the commit title:

```text
[feat/fix/chore](<ticket number>): <commit title>
```

Examples:

```text
chore(1): reset legacy workspace
feat(2): scaffold monorepo
```

**Body** must include:

```markdown
## Summary
- <1–3 bullets of why / what landed>

## Test plan
- [ ] <QA / verify steps — prefer pnpm install + bun run checks from the ticket>
```

Base branch: **`dev`** (unless the user explicitly asks for `main`).

## Agent rules

1. Read this skill before `git commit` or `gh pr create` for AgentOS ticket work.
2. Do not amend/force-push shared `dev`/`main` unless the user explicitly requests a history rewrite.
3. Match existing user commit rules (HEREDOC messages, no `-i`, no secrets).
4. After merging to `dev`, leave `main` alone unless the user asks for a release/promotion PR.
