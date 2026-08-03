"""Response envelope helpers ok() and fail() as per AGENTS.md §6 contract."""

from typing import Any
from fastapi.responses import JSONResponse


def ok(data: Any) -> dict:
    """Return a standard success response envelope."""
    return {"success": True, "data": data}


def fail(code: str, message: str, http_status: int = 502) -> JSONResponse:
    """Return a standard error response envelope with custom HTTP status code."""
    content = {
        "success": False,
        "error": {
            "code": code,
            "message": message
        }
    }
    return JSONResponse(status_code=http_status, content=content)
