"""Resume Analyzer contract (POST /api/analyze-resume)."""

from pydantic import BaseModel, Field


class ResumeRequest(BaseModel):
    resume_text: str
    target_role: str


class ResumeReport(BaseModel):
    score: int = Field(ge=0, le=100)
    formatting_issues: list[str]
    missing_skills: list[str]
    improved_bullets: list[str]
