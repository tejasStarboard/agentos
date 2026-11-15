"""Tests for agentos.ai and agentos.hitl clients."""

from __future__ import annotations

import httpx
import pytest
import respx

from agentos import ai, hitl


@pytest.mark.asyncio
@respx.mock
async def test_ai_generate_text(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("AGENT_OS_AI_API_BASE", "http://ai.test")
    respx.get("http://ai.test/health").mock(
        return_value=httpx.Response(200, json={"ok": True, "mode": "stub"}),
    )
    respx.post("http://ai.test/generate-text").mock(
        return_value=httpx.Response(200, json={"text": "hi"}),
    )
    health = await ai.health()
    assert health.mode == "stub"
    result = await ai.generate_text({"prompt": "hello"})
    assert result.text == "hi"


@pytest.mark.asyncio
@respx.mock
async def test_hitl_approvals(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("AGENT_OS_HITL_API_BASE", "http://hitl.test")
    approval = {
        "id": "a1",
        "title": "Pay",
        "status": "pending",
        "createdAt": "t",
    }
    respx.get("http://hitl.test/approvals").mock(
        return_value=httpx.Response(200, json={"approvals": [approval]}),
    )
    respx.post("http://hitl.test/approvals").mock(
        return_value=httpx.Response(200, json=approval),
    )
    respx.post("http://hitl.test/approvals/a1/resolve").mock(
        return_value=httpx.Response(
            200,
            json={**approval, "status": "approved", "resolvedAt": "t2"},
        ),
    )

    listed = await hitl.list_approvals()
    assert listed[0].id == "a1"
    created = await hitl.create_approval({"title": "Pay"})
    assert created.title == "Pay"
    resolved = await hitl.resolve_approval("a1", "approved")
    assert resolved.status == "approved"
