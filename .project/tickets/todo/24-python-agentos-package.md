# 24 — Python `agentos` package (parity)

**Status:** todo

## Goal
Publish/installable `packages/python` mirroring Node API domains for services (`agentos.auth`, `agentos.store`, `agentos.ai`, …).

## Done when
- [ ] `pyproject.toml` + install via `uv`/`pip install -e`
- [ ] FastAPI `create_app` + Depends for auth/RBAC
- [ ] store/ai/hitl clients call gateway builtins
- [ ] Documented: Python code lives in `services/`, not `extensions/`

## Notes
Used by invoice-bot service next.
