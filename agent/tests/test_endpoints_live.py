import asyncio
import sys
from pathlib import Path

# Add agent directory to sys.path
AGENT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(AGENT_ROOT))

import httpx
from main import app


async def run_all_tests():
    print("\n==========================================")
    print("RUNNING LIVE FASTAPI ENDPOINT INTEGRATION TESTS...")
    print("==========================================")

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        # 1. Health check
        res_health = await client.get("/health")
        assert res_health.status_code == 200
        print("[OK] GET /health Passed:", res_health.json())

        # 2. Analyze Resume Text
        payload_resume = {
            "resume_text": "Built full stack React and Node.js portal. Integrated REST APIs.",
            "target_role": "Full Stack Engineer",
        }
        res_resume = await client.post("/api/analyze-resume", json=payload_resume)
        assert res_resume.status_code == 200
        data_resume = res_resume.json()
        assert data_resume["success"] is True
        print(
            "[OK] POST /api/analyze-resume Passed (ATS Score:",
            data_resume["data"]["score"],
            ")",
        )

        # 3. Company Research
        payload_company = {"company": "Google", "role": "Software Engineer"}
        res_company = await client.post("/api/company-research", json=payload_company)
        assert res_company.status_code == 200
        data_company = res_company.json()
        assert data_company["success"] is True
        print(
            "[OK] POST /api/company-research Passed (Tech Stack:",
            len(data_company["data"]["techStack"]),
            "technologies)",
        )

        # 4. Prep Coach
        payload_coach = {
            "company": "Amazon",
            "role": "SDE-1",
            "round": "Technical Round 2 (DSA & System Design)",
        }
        res_coach = await client.post("/api/prep-coach", json=payload_coach)
        assert res_coach.status_code == 200
        data_coach = res_coach.json()
        assert data_coach["success"] is True
        print(
            "[OK] POST /api/prep-coach Passed (Topics:",
            len(data_coach["data"]["topics"]),
            "items)",
        )

    print("\n==========================================")
    print("[SUCCESS] ALL FASTAPI ENDPOINTS ARE FULLY FUNCTIONAL!")
    print("==========================================")


if __name__ == "__main__":
    asyncio.run(run_all_tests())
