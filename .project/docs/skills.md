# Agent skills

Skills teach Cursor/Claude how to plan and implement against AgentOS.

## Custom (this repo) — required for ticket work

| Skill                      | Path                                     | Use when                                                                          |
| -------------------------- | ---------------------------------------- | --------------------------------------------------------------------------------- |
| **agentos-architecture**   | `.agents/skills/agentos-architecture/`   | Any AgentOS design, ticket planning, or implementation                            |
| **agentos-ticket-planner** | `.agents/skills/agentos-ticket-planner/` | Planning or breaking down a `.project/tickets/*` item                             |
| **agentos-bun-runtime**    | `.agents/skills/agentos-bun-runtime/`    | Scripts/runtime: pnpm install + Bun execute (overrides “never pnpm” from bun-cli) |
| **agentos-git-workflow**   | `.agents/skills/agentos-git-workflow/`   | Commit/PR titles, `dev` vs `main`, no direct pushes to protected branches         |

Agents **must** read `.project/docs/concepts.md` (via these skills) before planning code changes.

Symlinked for Cursor discovery: `.cursor/skills/*` → `.agents/skills/…`.

## Third-party (vendored)

Under `.agents/skills/vendor/` (see that README):

| Skill                  | Role                                            |
| ---------------------- | ----------------------------------------------- |
| `impeccable`           | UI craft / critique / audit                     |
| `ui-ux-kit`            | Anti-slop design system workflow                |
| `anti-ui-slop`         | UI finish gate                                  |
| `react-best-practices` | React performance / quality                     |
| `bun-cli`              | Bun commands (use with **agentos-bun-runtime**) |
| `parallel-code-review` | Security/perf/correctness/readability review    |

FastAPI security reference: `.project/docs/references/python-fastapi-web-server-security.md`.

Optional machine install:

```bash
uvx library-skills install --skill fastapi --yes
```
