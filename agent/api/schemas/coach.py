"""Round-wise Prep Coach contract (POST /api/prep-coach)."""

from pydantic import BaseModel


class CoachRequest(BaseModel):
    company: str
    role: str
    round: str


class PrepPlan(BaseModel):
    topic_checklist: list[str]
    likely_questions: list[str]
    round_strategy: str
