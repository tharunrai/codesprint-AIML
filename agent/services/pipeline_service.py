"""Pipeline Services for Profile, Matching, Auto-Apply and Notifications."""

from pathlib import Path
from api.schemas.pipeline_schemas import (
    ProfileResponse, 
    MatchResponse, 
    DraftApplicationResponse, 
    NotificationResponse
)
from core.json_utils import extract_json
from core.llm_client import chat

PROMPTS_DIR = Path(__file__).resolve().parent.parent.parent / "prompts"

def _get_prompt(filename: str) -> str:
    path = PROMPTS_DIR / filename
    if path.exists():
        return path.read_text(encoding="utf-8")
    raise FileNotFoundError(f"Prompt {filename} not found.")

def build_profile(student_data: dict) -> ProfileResponse:
    system_prompt = _get_prompt("profile_builder.md")
    user_prompt = f"Student Raw Data:\n{student_data}"
    
    raw_response = chat(system_prompt, user_prompt)
    json_data = extract_json(raw_response)
    
    return ProfileResponse(**json_data)

def match_jobs(profile: dict, drives: list) -> MatchResponse:
    system_prompt = _get_prompt("job_matcher.md")
    user_prompt = f"Student Verified Profile:\n{profile}\n\nOpen Drives:\n{drives}"
    
    raw_response = chat(system_prompt, user_prompt)
    json_data = extract_json(raw_response)
    
    return MatchResponse(**json_data)

def draft_application(profile: dict, drive: dict, student_id: str) -> DraftApplicationResponse:
    system_prompt = _get_prompt("auto_apply.md")
    user_prompt = f"Student ID: {student_id}\n\nVerified Profile:\n{profile}\n\nTarget Drive:\n{drive}"
    
    raw_response = chat(system_prompt, user_prompt)
    json_data = extract_json(raw_response)
    
    return DraftApplicationResponse(**json_data)

def generate_notification(event_type: str, data: dict) -> NotificationResponse:
    system_prompt = _get_prompt("notification.md")
    user_prompt = f"Event Type: {event_type}\n\nData:\n{data}"
    
    raw_response = chat(system_prompt, user_prompt)
    json_data = extract_json(raw_response)
    
    return NotificationResponse(**json_data)
