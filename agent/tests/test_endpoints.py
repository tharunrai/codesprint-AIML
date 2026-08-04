"""Endpoint tests with FastAPI TestClient."""

import pytest
from fastapi.testclient import TestClient
from main import app
from core.llm_client import LLMError
from unittest.mock import patch

client = TestClient(app)

# Fixed responses to match the API contract in AGENTS.md §5
MOCK_RESUME_RESPONSE = '{"score": 85, "summary": "Great resume", "sections": [{"title": "ATS", "score": 90, "feedback": "Good", "suggestions": ["Keep it up"]}], "topStrengths": ["Coding"], "criticalFixes": ["Add metrics"]}'
MOCK_COMPANY_RESPONSE = '{"companyName": "Google", "role": "SDE", "overview": "Tech giant", "techStack": ["Python", "Go"], "culture": "Fast-paced", "interviewProcess": "OA -> Onsite", "recentNews": ["AI launched"], "salaryRange": "Varies", "tips": ["Practice DSA"]}'
MOCK_COACH_RESPONSE = '{"company": "Google", "title": "Tech Round", "description": "DSA focus", "topics": [{"name": "Arrays", "priority": "High", "description": "Two pointers"}], "questionTypes": ["Coding"], "resources": [{"name": "LeetCode", "url": "https://leetcode.com", "description": "Practice"}], "proTips": ["Think out loud"]}'


@patch('services.resume_service.chat')
def test_analyze_resume(mock_chat):
    mock_chat.return_value = MOCK_RESUME_RESPONSE
    response = client.post("/api/analyze-resume", json={"resume_text": "I code", "target_role": "SDE"})
    assert response.status_code == 200
    res_json = response.json()
    assert res_json["success"] is True
    assert res_json["data"]["score"] == 85
    assert "topStrengths" in res_json["data"]

@patch('services.company_service.chat')
def test_company_research(mock_chat):
    mock_chat.return_value = MOCK_COMPANY_RESPONSE
    response = client.post("/api/company-research", json={"company": "Google", "role": "SDE"})
    assert response.status_code == 200
    res_json = response.json()
    assert res_json["success"] is True
    assert res_json["data"]["companyName"] == "Google"

@patch('services.coach_service.chat')
def test_prep_coach(mock_chat):
    mock_chat.return_value = MOCK_COACH_RESPONSE
    response = client.post("/api/prep-coach", json={"company": "Google", "role": "SDE", "round": "Tech Round"})
    assert response.status_code == 200
    res_json = response.json()
    assert res_json["success"] is True
    assert res_json["data"]["company"] == "Google"
    assert len(res_json["data"]["topics"]) == 1

def test_invalid_request_body():
    response = client.post("/api/analyze-resume", json={"wrong": "body"})
    assert response.status_code == 422

@patch('services.resume_service.chat')
def test_llm_failure(mock_chat):
    mock_chat.side_effect = LLMError("Network timeout")
    response = client.post("/api/analyze-resume", json={"resume_text": "I code", "target_role": "SDE"})
    assert response.status_code == 502
    res_json = response.json()
    assert res_json["success"] is False
    assert res_json["error"]["code"] == "LLM_FAILED"
