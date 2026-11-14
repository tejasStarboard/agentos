# 18 — Builtin `ai`

**Status:** todo

## Goal

Platform AI surface: generateText/Image/embed (mock providers OK), tools/skills/agents runtime used by Shell chat.

## Done when

- [ ] `generateText` (and stubs for image/embed) via `/api/ext/ai/*`
- [ ] Runs tools against `/api/ext/<id>/tools/<name>` through gateway
- [ ] Composes `instructions.md` from enabled extensions
- [ ] Shell chat uses this builtin (not ad-hoc Vite mock forever)

## Notes

Real LLM providers can be env-gated later.
