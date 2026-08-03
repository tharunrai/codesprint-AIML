"""Round-wise Prep Coach Service."""

from pathlib import Path
from api.schemas.coach import PrepPlan
from core.json_utils import extract_json
from core.llm_client import chat

PROMPTS_DIR = Path(__file__).resolve().parent.parent / "prompts"
PROMPT_FILE = PROMPTS_DIR / "coach.md"


def _get_system_prompt() -> str:
    if PROMPT_FILE.exists():
        return PROMPT_FILE.read_text(encoding="utf-8")
    return (
        "You are a placement prep coach. Output ONLY valid JSON with keys: "
        "topic_checklist (list), likely_questions (list), round_strategy."
    )


def generate_prep_plan(company: str, role: str, round_name: str) -> PrepPlan:
    """Generate round preparation coach plan and return a validated PrepPlan."""
    system_prompt = _get_system_prompt()
    user_prompt = f"Company:\n{company}\n\nRole:\n{role}\n\nRound:\n{round_name}"

    raw_response = chat(system_prompt, user_prompt)
    json_data = extract_json(raw_response)

    return PrepPlan(**json_data)
