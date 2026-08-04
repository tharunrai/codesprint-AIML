from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any

from services.pipeline_service import (
    build_profile,
    match_jobs,
    draft_application,
    generate_notification
)
from api.schemas.pipeline_schemas import (
    ProfileResponse,
    MatchResponse,
    DraftApplicationResponse,
    NotificationResponse
)

router = APIRouter(prefix="/api/pipeline", tags=["Pipeline"])

class BuildProfileRequest(BaseModel):
    student_data: Dict[str, Any]

class MatchJobsRequest(BaseModel):
    profile: Dict[str, Any]
    drives: List[Dict[str, Any]]

class DraftApplicationRequest(BaseModel):
    student_id: str
    profile: Dict[str, Any]
    drive: Dict[str, Any]

class NotificationRequest(BaseModel):
    event_type: str
    data: Dict[str, Any]

@router.post("/build-profile", response_model=ProfileResponse)
async def api_build_profile(req: BuildProfileRequest):
    try:
        return build_profile(req.student_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/match-jobs", response_model=MatchResponse)
async def api_match_jobs(req: MatchJobsRequest):
    try:
        return match_jobs(req.profile, req.drives)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/draft-application", response_model=DraftApplicationResponse)
async def api_draft_application(req: DraftApplicationRequest):
    try:
        return draft_application(req.profile, req.drive, req.student_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/notification", response_model=NotificationResponse)
async def api_notification(req: NotificationRequest):
    try:
        return generate_notification(req.event_type, req.data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
