# 14 — Agent control-plane routes

**Status:** in-progress

## Goal

Add `/api/agent/registry`, enable/disable (customer only), and thin chat/HITL entrypoints that will delegate to builtins.

## Done when

- [x] `GET /api/agent/registry` returns enabled contributions only
- [x] Enable API rejects `driven: true` builtins
- [x] Chat/HITL stubs route toward builtin `ai` / `hitl` (full impl in later tickets)

## Notes

Keep gateway thin; builtins own real logic.
