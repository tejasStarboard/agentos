# 14 — Agent control-plane routes

**Status:** todo

## Goal
Add `/api/agent/registry`, enable/disable (customer only), and thin chat/HITL entrypoints that will delegate to builtins.

## Done when
- [ ] `GET /api/agent/registry` returns enabled contributions only
- [ ] Enable API rejects `driven: true` builtins
- [ ] Chat/HITL stubs route toward builtin `ai` / `hitl` (full impl in later tickets)

## Notes
Keep gateway thin; builtins own real logic.
