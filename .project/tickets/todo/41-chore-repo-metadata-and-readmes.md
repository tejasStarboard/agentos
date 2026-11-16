# 41 — Chore: git metadata, package.json, and READMEs

**Status:** todo

## Goal

Bring repo identity and docs in line with the current AgentOS monorepo: fill missing **git / package metadata**, normalize **`package.json` / `pyproject.toml` fields**, and refresh **READMEs** so they match reality (not early scaffold status).

## Depends on

- None (chore / docs). Can run anytime; does not block or require tickets 29–40.

## Done when

- [ ] Workspace packages declare consistent identity fields where useful: `name`, `description`, `version`, `private`, `license` (and `repository` / `bugs` / `homepage` on publishable or root packages pointing at the real GitHub remote)
- [ ] Root + `packages/core`, `packages/ui`, `examples/client-app`, `tooling/typescript-config` `package.json` contents reviewed (scripts, engines, `packageManager`, descriptions) — no stale names or leftover scaffold copy
- [ ] Python side aligned: `packages/python/pyproject.toml` (+ sample `services/*/pyproject.toml` if needed) has accurate `name` / `description` / optional URLs
- [ ] Root [`README.md`](../../../README.md) Status section (and any other stale “tickets 1–2 / next is 3” language) updated to current experiment state + pointers to `.project/docs` and tickets
- [ ] Package / service READMEs present or updated where missing or misleading (`packages/core`, `packages/ui`, `packages/python`, `services/invoice-bot`, sample app if needed) — short, accurate, link to concepts/docs
- [ ] No product behavior changes; chore-only PR (`chore/41-…`)

## Notes

**Likely gaps today**

- Root README still reads as post-scaffold (“tickets **1–2**… next ticket **3**”) while much of the platform is already built.
- Most `package.json` files lack `repository` / `bugs` / `homepage` / `license`; descriptions are uneven.
- Git remote is `https://github.com/tejasStarboard/agentos.git` — metadata should match that (or whatever the canonical remote becomes).
- No root `LICENSE` file today; add only if the owners want one as part of this chore (confirm license choice before inventing one).

**Out of scope**

- Rewriting `.project/docs` architecture/ADRs (ticket 28 territory) unless a README link is broken.
- Changing runtime scripts for product features (dev/CLI) beyond correcting docs or clearly wrong metadata.
- Moving tickets to `done/` or renumbering the build sequence.

**Verify**

- Skim `git remote -v` vs `package.json` `repository.url`
- `pnpm install` still succeeds after metadata-only edits
- Spot-check README links resolve
