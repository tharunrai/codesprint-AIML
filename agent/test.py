import os
import json
import urllib.request
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("AI_API_KEY", "sk-si6TDKxLKn9NULA7vQ2MbMUevThigzqwV4NjG860WJzaRevXMuioTLJkZEYP6YIP")
BASE_URL = os.getenv("AI_BASE_URL", "https://opencode.ai/zen/v1")
MODEL_NAME = os.getenv("AI_MODEL_NAME", "deepseek-v4-flash-free")

def call_ai_agent(system_prompt: str, user_prompt: str) -> str:
    url = f"{BASE_URL.rstrip('/')}/chat/completions"
    headers = {
        "Authorization": f"Bearer {API_KEY.strip()}",
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0"
    }
    payload = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": 0.2
    }
    
    req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers=headers, method='POST')
    with urllib.request.urlopen(req, timeout=45) as response:
        data = json.loads(response.read().decode('utf-8'))
        content = data["choices"][0]["message"]["content"]
        return content

def test_resume_analyzer():
    print("\n==========================================")
    print("1. TESTING RESUME ANALYZER AGENT...")
    print("==========================================")
    sys_prompt = "You are an expert ATS Resume Reviewer. Output ONLY valid JSON with keys: score (0-100), formatting_issues (list), missing_skills (list), improved_bullets (list)."
    user_prompt = "Resume: Built full stack React node app. Target Role: Senior Full Stack Engineer (Next.js, TypeScript, PostgreSQL)."
    res = call_ai_agent(sys_prompt, user_prompt)
    print("Result:\n", res)

def test_company_research():
    print("\n==========================================")
    print("2. TESTING COMPANY RESEARCH AGENT...")
    print("==========================================")
    sys_prompt = "You are a Tech Company Career Researcher. Output ONLY valid JSON with keys: company_overview, tech_stack (list), domain_focus, interview_pattern."
    user_prompt = "Company: Google. Role: Software Engineer."
    res = call_ai_agent(sys_prompt, user_prompt)
    print("Result:\n", res)

def test_prep_coach():
    print("\n==========================================")
    print("3. TESTING ROUND PREP COACH AGENT...")
    print("==========================================")
    sys_prompt = "You are a Placement Round Prep Coach. Output ONLY valid JSON with keys: topic_checklist (list), likely_questions (list), round_strategy."
    user_prompt = "Company: Amazon. Role: SDE-1. Round: Technical Round 2 (Data Structures & System Design)."
    res = call_ai_agent(sys_prompt, user_prompt)
    print("Result:\n", res)

if __name__ == "__main__":
    print(f"Using Provider Base URL: {BASE_URL}")
    print(f"Using Model: {MODEL_NAME}")
    try:
        test_resume_analyzer()
        test_company_research()
        test_prep_coach()
        print("\n==========================================")
        print("[SUCCESS] ALL 3 AGENT ENDPOINTS TESTED SUCCESSFULLY WITH DEEPSEEK-V4-FLASH-FREE!")
        print("==========================================")
    except Exception as e:
        print("\n[ERROR] Test failed:", e)
        if hasattr(e, 'read'):
            try:
                print("Error Details:", e.read().decode('utf-8'))
            except:
                pass
