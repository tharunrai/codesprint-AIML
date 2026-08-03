"""Company Research contract (POST /api/company-research)."""

from pydantic import BaseModel


class CompanyRequest(BaseModel):
    company: str
    role: str


class CompanyBrief(BaseModel):
    company_overview: str
    tech_stack: list[str]
    domain_focus: str
    interview_pattern: str
