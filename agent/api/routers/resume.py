"""Resume Analyzer Router (POST /api/analyze-resume & POST /api/analyze-resume-file)."""

from fastapi import APIRouter, File, Form, UploadFile
from pydantic import ValidationError
from api.envelope import fail, ok
from api.schemas.resume import ResumeRequest
from core.file_utils import FileProcessingError, extract_pdf_text
from core.json_utils import JSONExtractionError
from core.llm_client import LLMError
from services.resume_service import analyze_resume

router = APIRouter(tags=["Resume Analyzer"])


@router.post("/api/analyze-resume")
def analyze_resume_text(request: ResumeRequest):
    """Analyze plain text resume against target role."""
    try:
        report = analyze_resume(request.resume_text, request.target_role)
        return ok(report.model_dump())
    except LLMError as exc:
        return fail("LLM_FAILED", str(exc), http_status=502)
    except (JSONExtractionError, ValidationError) as exc:
        return fail("LLM_INVALID_RESPONSE", str(exc), http_status=502)
    except Exception as exc:
        return fail("INTERNAL_ERROR", f"Unexpected error: {exc}", http_status=500)


@router.post("/api/analyze-resume-file")
async def analyze_resume_file(
    file: UploadFile = File(...),
    target_role: str = Form(...),
):
    """Analyze uploaded PDF resume file against target role."""
    if not file.filename.lower().endswith(".pdf"):
        return fail(
            "INVALID_FILE_TYPE",
            "Only PDF files (.pdf) are supported.",
            http_status=422,
        )

    try:
        content = await file.read()
        if len(content) > 5 * 1024 * 1024:  # 5MB cap
            return fail(
                "FILE_TOO_LARGE",
                "File size exceeds the 5MB limit.",
                http_status=422,
            )

        resume_text = extract_pdf_text(content)
        report = analyze_resume(resume_text, target_role)
        return ok(report.model_dump())
    except FileProcessingError as exc:
        return fail("EMPTY_DOCUMENT", str(exc), http_status=422)
    except LLMError as exc:
        return fail("LLM_FAILED", str(exc), http_status=502)
    except (JSONExtractionError, ValidationError) as exc:
        return fail("LLM_INVALID_RESPONSE", str(exc), http_status=502)
    except Exception as exc:
        return fail("INTERNAL_ERROR", f"Unexpected error: {exc}", http_status=500)
