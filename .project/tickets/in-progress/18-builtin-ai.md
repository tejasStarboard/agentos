# 18 — Builtin `ai`

**Status:** in-progress

## Goal

Platform AI surface: generateText/Image/embed (mock providers OK), tools/skills/agents runtime used by Shell chat.

## Done when

- [x] `generateText` (and stubs for image/embed) via `/api/ext/ai/*`
- [x] Runs tools against `/api/ext/<id>/tools/<name>` through gateway
- [x] Composes `instructions.md` from enabled extensions
- [x] Shell chat uses this builtin (not ad-hoc Vite mock forever)

## Notes

Real LLM providers can be env-gated later. Runtime is Vercel AI SDK v7 (ADR 006); mock models are the default.
