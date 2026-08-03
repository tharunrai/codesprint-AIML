"""Endpoint tests with FastAPI TestClient + mocked LLM client.

TODO: test cases
  - POST /api/analyze-resume returns {success, data} with ResumeReport shape
  - POST /api/company-research / api/prep-coach same
  - invalid request body → 422
  - LLM failure → error envelope, not a crash
"""
