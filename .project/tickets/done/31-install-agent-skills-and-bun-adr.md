# 31 — Install agent skills + ADR for pnpm/Bun hybrid

**Status:** done

## Goal

Install the agreed AI skills and document runtime policy: **pnpm for workspaces, Bun for running TS/JS**.

## Done when

- [x] Skills installed: custom AgentOS skills + vendored impeccable, ui-ux-kit, anti-ui-slop, react-best-practices, bun-cli, parallel-code-review
- [x] ADR `.project/docs/adr/001-pnpm-bun-hybrid.md`
- [x] Root README + concepts mention the hybrid
- [ ] `package.json` scripts use `bun`/`bunx` — deferred until monorepo scaffold (ticket 2–3)
- [x] Ticket README includes ticket 31; FastAPI security reference vendored under `.project/docs/references/`
- [x] `agentos-bun-runtime` skill overrides “never pnpm” from bun-cli

## Notes

Official FastAPI skill: install locally with `uvx library-skills install --skill fastapi --yes` when building Python services.
