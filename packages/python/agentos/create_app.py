"""agentos.create_app — FastAPI factory with built-in health (ticket 24)."""

from __future__ import annotations

from fastapi import FastAPI


def create_app() -> FastAPI:
    """Create a FastAPI app with built-in `GET /health` → `{ ok: true }`."""
    app = FastAPI(title="AgentOS service")

    @app.get("/health")
    async def health() -> dict[str, bool]:
        return {"ok": True}

    return app
