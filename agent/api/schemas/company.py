"""Company Research contract (POST /api/company-research)."""

from pydantic import BaseModel


class CompanyRequest(BaseModel):
    company: str
    role: str


class CompanyBrief(BaseModel):
    companyName: str
    role: str
    overview: str
    techStack: list[str]
    culture: str
    interviewProcess: str
    recentNews: list[str]
    salaryRange: str
    tips: list[str]
