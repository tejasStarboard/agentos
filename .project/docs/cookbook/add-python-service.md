# Cookbook — Add a Python service for an extension

1. Keep UI/agent under `extensions/my-feature/` (TypeScript only).
2. Create `services/my-feature/` with FastAPI + `pyproject.toml`.
3. Depend on the `agentos` Python package; use `agentos.auth` / `agentos.store` / etc.
4. Point `extensions/my-feature/meta.json` → `"api.language": "python"`, `"root": "../../services/my-feature"`.
5. `bun dev` (via `packages/core/scripts/dev-bffs.ts`) starts uvicorn for each
   extension with `api.language: "python"` and proxies `/api/ext/<id>/*`.
   (`agentos dev` in ticket 27 will wrap the same behavior.)

Do **not** put Python packages inside `extensions/my-feature/`.
