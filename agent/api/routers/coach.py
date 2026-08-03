"""Round-wise Prep Coach Router (POST /api/prep-coach)."""

from fastapi import APIRouter
from pydantic import ValidationError
from api.envelope import fail, ok
from api.schemas.coach import CoachRequest
from core.json_utils import JSONExtractionError
from core.llm_client import LLMError
from services.coach_service import generate_prep_plan

router = APIRouter(tags=["Prep Coach"])


@router.post("/api/prep-coach")
def prep_coach_endpoint(request: CoachRequest):
    """Generate round-wise prep plan for candidate."""
    try:
        plan = generate_prep_plan(request.company, request.role, request.round)
        return ok(plan.model_dump())
    except LLMError as exc:
        return fail("LLM_FAILED", str(exc), http_status=502)
    except (JSONExtractionError, ValidationError) as exc:
        return fail("LLM_INVALID_RESPONSE", str(exc), http_status=502)
    except Exception as exc:
        return fail("INTERNAL_ERROR", f"Unexpected error: {exc}", http_status=500)
