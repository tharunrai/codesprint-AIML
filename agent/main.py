from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from pydantic import BaseModel

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Placement Portal AI Agent",
    description="AI backend for Resume Analysis, Company Research, and Prep Coaching.",
    version="1.0.0"
)

# Configure CORS so the frontend can communicate with this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "AI Agent API is running!"}

# Example Request Model
class ResumeRequest(BaseModel):
    resume_text: str
    target_role: str

@app.post("/api/analyze-resume")
def analyze_resume(request: ResumeRequest):
    # TODO: Implement Anthropic API integration here
    # Example placeholder response
    return {
        "score": 85,
        "feedback": "Resume looks good, but add more metrics to your bullet points.",
        "missing_skills": ["TypeScript", "Next.js"]
    }
