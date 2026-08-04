"""FastAPI Application Entry Point.

Mounts CORS middleware and feature routers for:
1. Resume Analyzer (/api/analyze-resume, /api/analyze-resume-file)
2. Company Research Assistant (/api/company-research)
3. Round-wise Prep Coach (/api/prep-coach)
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import time
import logging

from config import AI_MODEL_NAME
from api.routers.coach import router as coach_router
from api.routers.company import router as company_router
from api.routers.resume import router as resume_router
from api.routers.pipeline import router as pipeline_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("api")

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

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = (time.time() - start_time) * 1000
    logger.info(f"{request.method} {request.url.path} - {response.status_code} - {process_time:.2f}ms - model: {AI_MODEL_NAME}")
    return response

# Include feature routers
app.include_router(resume_router)
app.include_router(company_router)
app.include_router(coach_router)
app.include_router(pipeline_router)


@app.get("/")
def read_root():
    """Root endpoint for status check."""
    return {"message": "Placement Portal AI Agent API is running!", "status": "ok"}


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "placement-portal-agent"}
