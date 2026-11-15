"""agentos.auth — session + RBAC Depends stubs (ticket 21).

Full FastAPI Depends + HTTP client against gateway `/api/ext/auth/*`
is completed in ticket 24.
"""

from __future__ import annotations

from typing import Any, Callable


def require_session() -> Callable[..., Any]:
    """Placeholder for FastAPI Depends session guard (ticket 24)."""
    raise NotImplementedError(
        "agentos.auth.require_session is a stub; complete in ticket 24",
    )


def require_roles(*roles: str) -> Callable[..., Any]:
    """Placeholder for FastAPI Depends role guard (ticket 24)."""
    raise NotImplementedError(
        "agentos.auth.require_roles is a stub; complete in ticket 24",
    )


def require_permissions(*permissions: str) -> Callable[..., Any]:
    """Placeholder for FastAPI Depends permission guard (ticket 24)."""
    raise NotImplementedError(
        "agentos.auth.require_permissions is a stub; complete in ticket 24",
    )
