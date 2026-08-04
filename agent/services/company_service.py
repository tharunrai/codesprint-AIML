"""Company Research Service."""

from pathlib import Path
from api.schemas.company import CompanyBrief
from core.json_utils import extract_json
from core.llm_client import chat

PROMPTS_DIR = Path(__file__).resolve().parent.parent / "prompts"
PROMPT_FILE = PROMPTS_DIR / "company.md"


def _get_system_prompt() -> str:
    if PROMPT_FILE.exists():
        return PROMPT_FILE.read_text(encoding="utf-8")
    return (
        "You are a campus placement research assistant. Output ONLY valid JSON with keys: "
        "companyName, role, overview, techStack (list), culture, interviewProcess, recentNews (list), salaryRange, tips (list)."
    )


def research_company(company: str, role: str) -> CompanyBrief:
    """Generate company research briefing and return a validated CompanyBrief."""
    system_prompt = _get_system_prompt()
    user_prompt = f"Company Name:\n{company}\n\nTarget Role:\n{role}"

    raw_response = chat(system_prompt, user_prompt)
    json_data = extract_json(raw_response)

    return CompanyBrief(**json_data)
