# Cookbook — Add a Python service for an extension

1. Keep UI/agent under `extensions/my-feature/` (TypeScript only).
2. Create `services/my-feature/` with FastAPI + `pyproject.toml`.
3. Depend on the `agentos` Python package; use `agentos.auth` / `agentos.store` / etc.
4. Point `extensions/my-feature/meta.json` → `"api.language": "python"`, `"root": "../../services/my-feature"`.
5. `agentos dev` should start uvicorn for that service and proxy `/api/ext/my-feature/*`.

Do **not** put Python packages inside `extensions/my-feature/`.
