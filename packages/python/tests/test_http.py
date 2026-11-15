"""Tests for agentos.http gateway helpers."""

from __future__ import annotations

import httpx
import pytest
import respx

from agentos.http import (
    DEFAULT_GATEWAY,
    get_json,
    post_json,
    resolve_ext_api_base,
    resolve_gateway_url,
)


def test_resolve_gateway_url_default() -> None:
    assert resolve_gateway_url({}) == DEFAULT_GATEWAY


def test_resolve_gateway_url_override_strips_slash() -> None:
    assert (
        resolve_gateway_url({"AGENT_OS_GLOBAL_GATEWAY_URL": "http://gw.example/"})
        == "http://gw.example"
    )


def test_resolve_ext_api_base_from_gateway() -> None:
    env = {"AGENT_OS_GLOBAL_GATEWAY_URL": "http://gw"}
    assert resolve_ext_api_base("ai", "AGENT_OS_AI_API_BASE", env) == (
        "http://gw/api/ext/ai"
    )


def test_resolve_ext_api_base_override() -> None:
    env = {"AGENT_OS_AI_API_BASE": "http://custom/ai/"}
    assert resolve_ext_api_base("ai", "AGENT_OS_AI_API_BASE", env) == "http://custom/ai"


@pytest.mark.asyncio
@respx.mock
async def test_post_json_ok() -> None:
    route = respx.post("http://example/x").mock(
        return_value=httpx.Response(200, json={"ok": True}),
    )
    result = await post_json("http://example/x", {"a": 1}, "test")
    assert result == {"ok": True}
    assert route.called


@pytest.mark.asyncio
@respx.mock
async def test_get_json_error() -> None:
    respx.get("http://example/x").mock(
        return_value=httpx.Response(500, text="boom"),
    )
    with pytest.raises(RuntimeError, match="test failed \\(500\\)"):
        await get_json("http://example/x", "test")
