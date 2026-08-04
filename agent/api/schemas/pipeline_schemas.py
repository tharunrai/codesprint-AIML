from pydantic import BaseModel, Field
from typing import List, Optional

class EligibilityFlags(BaseModel):
    hasVerifiedResume: bool
    hasVerifiedMarksheet: bool

class ProfileResponse(BaseModel):
    branch: str
    graduationYear: int
    cgpa: Optional[float]
    verifiedSkills: List[str]
    verifiedDocuments: List[str]
    strengthSummary: str
    eligibilityFlags: EligibilityFlags

class MatchItem(BaseModel):
    driveId: str
    score: int
    eligible: bool
    reasoning: str
    matchedSkills: List[str]

class MatchResponse(BaseModel):
    matches: List[MatchItem]

class DraftApplicationResponse(BaseModel):
    driveId: str
    studentId: str
    coverNote: str
    attachedDocuments: List[str]
    confidenceNote: str

class NotificationResponse(BaseModel):
    title: str
    body: str
