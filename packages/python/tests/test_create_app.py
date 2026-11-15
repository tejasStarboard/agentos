"""Tests for agentos.create_app."""

from __future__ import annotations

from fastapi.testclient import TestClient

from agentos import create_app


def test_health_route() -> None:
    app = create_app()
    client = TestClient(app)
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"ok": True}
