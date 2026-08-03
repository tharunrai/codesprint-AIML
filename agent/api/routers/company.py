"""Company Research Assistant Router (POST /api/company-research)."""

from fastapi import APIRouter
from pydantic import ValidationError
from api.envelope import fail, ok
from api.schemas.company import CompanyRequest
from core.json_utils import JSONExtractionError
from core.llm_client import LLMError
from services.company_service import research_company

router = APIRouter(tags=["Company Research"])


@router.post("/api/company-research")
def research_company_endpoint(request: CompanyRequest):
    """Generate company briefing for a specific role."""
    try:
        brief = research_company(request.company, request.role)
        return ok(brief.model_dump())
    except LLMError as exc:
        return fail("LLM_FAILED", str(exc), http_status=502)
    except (JSONExtractionError, ValidationError) as exc:
        return fail("LLM_INVALID_RESPONSE", str(exc), http_status=502)
    except Exception as exc:
        return fail("INTERNAL_ERROR", f"Unexpected error: {exc}", http_status=500)
