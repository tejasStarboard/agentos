"""agentos.hitl — HTTP client for builtin `hitl` (ticket 24)."""

from __future__ import annotations

from typing import Any, Literal
from urllib.parse import quote

from pydantic import BaseModel, Field

from agentos.http import EnvMap, get_json, post_json, resolve_ext_api_base

ApprovalStatus = Literal["pending", "approved", "rejected"]


def resolve_hitl_api_base(env: EnvMap | None = None) -> str:
    """Resolve builtin hitl API base (`…/api/ext/hitl` or test override)."""
    return resolve_ext_api_base("hitl", "AGENT_OS_HITL_API_BASE", env)


class Approval(BaseModel):
    id: str
    title: str
    body: str | None = None
    metadata: dict[str, Any] | None = None
    status: ApprovalStatus
    createdAt: str
    resolvedAt: str | None = None


class CreateApprovalInput(BaseModel):
    title: str
    body: str | None = None
    metadata: dict[str, Any] | None = None


class ListApprovalsResult(BaseModel):
    approvals: list[Approval] = Field(default_factory=list)


async def list_approvals(
    status: ApprovalStatus | None = None,
    env: EnvMap | None = None,
) -> list[Approval]:
    base = resolve_hitl_api_base(env)
    url = (
        f"{base}/approvals?status={quote(status)}"
        if status
        else f"{base}/approvals"
    )
    data = await get_json(url, "hitl listApprovals")
    return ListApprovalsResult.model_validate(data).approvals


async def create_approval(
    input: CreateApprovalInput | dict[str, Any],
    env: EnvMap | None = None,
) -> Approval:
    base = resolve_hitl_api_base(env)
    body = (
        input.model_dump(exclude_none=True)
        if isinstance(input, CreateApprovalInput)
        else input
    )
    data = await post_json(f"{base}/approvals", body, "hitl createApproval")
    return Approval.model_validate(data)


async def resolve_approval(
    id: str,
    decision: Literal["approved", "rejected"],
    env: EnvMap | None = None,
) -> Approval:
    base = resolve_hitl_api_base(env)
    data = await post_json(
        f"{base}/approvals/{quote(id, safe='')}/resolve",
        {"decision": decision},
        "hitl resolveApproval",
    )
    return Approval.model_validate(data)
