"""FastAPI Application Entry Point.

Mounts CORS middleware and feature routers for:
1. Resume Analyzer (/api/analyze-resume, /api/analyze-resume-file)
2. Company Research Assistant (/api/company-research)
3. Round-wise Prep Coach (/api/prep-coach)
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routers.coach import router as coach_router
from api.routers.company import router as company_router
from api.routers.resume import router as resume_router

app = FastAPI(
    title="Placement Portal AI Agent API",
    description="Backend microservice for ATS Resume Analysis, Company Research, and Round Prep Coaching.",
    version="1.0.0",
)

# Configure CORS for frontend cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include feature routers
app.include_router(resume_router)
app.include_router(company_router)
app.include_router(coach_router)


@app.get("/")
def read_root():
    """Root endpoint for status check."""
    return {"message": "Placement Portal AI Agent API is running!", "status": "ok"}


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "placement-portal-agent"}
