"""Resume Analyzer contract (POST /api/analyze-resume & POST /api/analyze-resume-file).

Re-aligned to AGENTS.md §5 frontend contract.
"""

from pydantic import BaseModel, Field


class ResumeRequest(BaseModel):
    resume_text: str
    target_role: str


class ResumeSection(BaseModel):
    title: str
    score: int = Field(ge=0, le=100)
    feedback: str
    suggestions: list[str]


class ResumeReport(BaseModel):
    score: int = Field(ge=0, le=100)
    summary: str
    sections: list[ResumeSection]
    topStrengths: list[str]
    criticalFixes: list[str]
