# Vendored third-party skills

Copies of upstream `SKILL.md` files for offline/agent discovery. Prefer upstream updates periodically.

| Folder | Upstream |
|--------|----------|
| `react-best-practices` | vercel-labs/agent-skills |
| `bun-cli` | dmythro/agent-skills |
| `ui-ux-kit` | arham777/ui-ux-kit |
| `impeccable` | pbakaus/impeccable |
| `parallel-code-review` | spencerpauly/awesome-cursor-skills |
| `anti-ui-slop` | uizze/uizze |

**Always also load** repo custom skills:

- `../agentos-architecture`
- `../agentos-ticket-planner`
- `../agentos-bun-runtime` (pnpm + Bun hybrid)

FastAPI security reference (doc): `.project/docs/references/python-fastapi-web-server-security.md`.

Install official FastAPI skill on a machine with:

```bash
uvx library-skills install --skill fastapi --yes
```
