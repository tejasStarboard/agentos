# 24 — Python `agentos` package (parity)

**Status:** in-progress

## Goal

Publish/installable `packages/python` mirroring Node API domains for services (`agentos.auth`, `agentos.store`, `agentos.ai`, …).

## Done when

- [x] `pyproject.toml` + install via `uv`/`pip install -e`
- [x] FastAPI `create_app` + Depends for auth/RBAC
- [x] store/ai/hitl clients call gateway builtins
- [x] Documented: Python code lives in `services/`, not `extensions/`

## Notes

Used by invoice-bot service next.
