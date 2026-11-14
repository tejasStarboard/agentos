# 2 — Scaffold AgentOS monorepo

**Status:** done

## Goal

Create the pnpm workspace skeleton for `@agentos/core`, Python `agentos`, and `examples/client-app`.

## Done when

- [x] `pnpm-workspace.yaml` includes `packages/*`, `examples/*`, `services/*`
- [x] Empty/minimal packages exist: `packages/core`, `packages/python`, `examples/client-app`
- [x] Root `package.json` + `tsconfig.base.json` are AgentOS-named
- [x] `pnpm install` succeeds

## Notes

No Shell/UI logic yet — structure and package names only.
