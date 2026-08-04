"""Round-wise Prep Coach contract (POST /api/prep-coach)."""

from pydantic import BaseModel


class CoachRequest(BaseModel):
    company: str
    role: str
    round: str

class PrepTopic(BaseModel):
    name: str
    priority: str
    description: str

class PrepResource(BaseModel):
    name: str
    url: str
    description: str

class PrepPlan(BaseModel):
    company: str
    title: str
    description: str
    topics: list[PrepTopic]
    questionTypes: list[str]
    resources: list[PrepResource]
    proTips: list[str]
