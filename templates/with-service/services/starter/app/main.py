"""Starter service — FastAPI entry (with-service template)."""

from __future__ import annotations

from agentos import create_app

app = create_app()
app.title = "Starter"


@app.get("/hello")
async def hello() -> dict[str, object]:
    return {"ok": True, "message": "Hello from starter service"}
