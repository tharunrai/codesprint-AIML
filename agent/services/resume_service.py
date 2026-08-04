"""Resume Analyzer Service."""

from pathlib import Path
from api.schemas.resume import ResumeReport
from core.json_utils import extract_json
from core.llm_client import chat

PROMPTS_DIR = Path(__file__).resolve().parent.parent / "prompts"
PROMPT_FILE = PROMPTS_DIR / "resume.md"


def _get_system_prompt() -> str:
    if PROMPT_FILE.exists():
        return PROMPT_FILE.read_text(encoding="utf-8")
    return (
        "You are an expert ATS resume reviewer. Output ONLY valid JSON with keys: "
        "score (0-100), summary (str), sections (list of {title, score, feedback, suggestions}), topStrengths (list), criticalFixes (list)."
    )


def analyze_resume(resume_text: str, target_role: str) -> ResumeReport:
    """Analyze resume text against target role and return a validated ResumeReport."""
    system_prompt = _get_system_prompt()
    user_prompt = f"Resume Content:\n{resume_text}\n\nTarget Role:\n{target_role}"

    raw_response = chat(system_prompt, user_prompt)
    json_data = extract_json(raw_response)

    return ResumeReport(**json_data)
