# AI Agent Backend — AGENTS.md

> Single source of truth for the AI backend of the CodeSprint PS-1 Placement Portal.
> **Rule: EVERY change to this folder must be logged in the [Changelog](#changelog) at the bottom. No changelog entry = the change doesn't exist.**

---

## 0. How to use this file (READ THIS FIRST, AI agents included)

- This file is the **contract** between every human and AI agent working on `agent/`.
- If you are an AI coding agent (Claude Code, Cursor, Copilot, etc.): read the whole file before touching anything. The **Roadmap (§9)** is the plan — execute phases **in order**, one at a time, and stop at the end of each phase to verify + commit.
- **Never guess.** Every decision that matters is recorded below (§2, §5, §6, §9 per-phase "Locked"). If a step is unclear, look at the referenced file before inventing behavior. **When implementing a new endpoint or schema, copy the exact field names from §5 — they must match the frontend.**
- If you are told to implement a phase, do **only** that phase's steps. No unrelated refactors, no "improvements" outside the scope.
- After any change: update **§10 Current Status** and append a **Changelog** line. Commit with a message naming the phase.

---

## 1. What this is

Python **FastAPI** backend powering the 3 AI features of the placement portal (specs.md §4.5):

1. **Resume Analyzer** — scores a resume against a target role (text + PDF upload)
2. **Company Research Assistant** — generates a company + role briefing
3. **Round-wise Prep Coach** — prep plan for the student's current round

LLM: **DeepSeek (`deepseek-v4-flash-free`)** via **opencode zen** — an **OpenAI-compatible** API.
We do **NOT** use the Anthropic SDK. (`README.md` / `.env.example` currently mention Anthropic — STALE, being fixed in Phase 3.)

---

## 2. Architecture decision (LOCKED — don't silently change it)

**Pattern: per-endpoint LLM calls through a service layer. NOT a central agent with tools.**

Why (recorded so nobody re-litigates):
- All 3 features are single-shot "input → JSON output" tasks. No multi-step reasoning, no memory, no tool actions.
- A tool-using agent adds orchestration complexity with zero benefit for a 1-day demo.

**Revisit ONLY if** a feature needs live data or multi-step work (e.g. company research fetching real news, prep coach querying an alumni interview repo) → add a *tool* inside that feature's service then, not a central agent.

---

## 3. File map

| Path | Responsibility | State |
|---|---|---|
| `main.py` | FastAPI app: CORS, health, mounts routers. Keep thin. | ✅ done |
| `config.py` | All env config (key, base URL, model, timeouts) read once. | ✅ done |
| `api/routers/*.py` | One router per feature: validate → service → respond. | ✅ done |
| `api/schemas/*.py` | Pydantic request/response models — **must match §5 exactly**. | 🔄 re-align to §5 (frontend contract) |
| `api/envelope.py` | `ok()` / `fail()` response envelope helpers. | ✅ done |
| `core/llm_client.py` | The ONLY place that talks to the model. Timeout, retries. | ✅ done |
| `core/json_utils.py` | Parse/repair LLM JSON output. | ✅ done |
| `core/file_utils.py` | PDF text extraction (pypdf). | ✅ done |
| `services/*_service.py` | Business logic per feature: prompt → client → validate. | ✅ done (schema re-align only) |
| `prompts/*.md` | System prompts as files. **Must emit the §5 keys.** | 🔄 re-align to §5 |
| `tests/` | pytest — unit + endpoint tests (mocked client). | ❌ Phase 3 (currently empty) |
| `test.py` | Legacy manual test script. | 🔧 delete/archive in Phase 3 |

## 4. Data flow (one request)

```
POST /api/<feature>
  → api/routers/<feature>.py        validate body (Pydantic schema)
  → services/<feature>_service.py   load prompts/<feature>.md, build messages
  → core/llm_client.py              call DeepSeek (OpenAI-compatible), timeout + retry
  → core/json_utils.py              strip fences → json.loads → repair
  → validate against response schema (the §5 shape)
  → return {success: true, data}  |  {success: false, error: {code, message}}
```

## 5. API contract (v1 — LOCKED to the frontend)

> **This contract is the single source of truth. Field names here are the EXACT names the frontend renders** (`app/web/src/app/api/ai/route.ts` result interfaces). **Never rename a shared field.** If a name changes, update this table, every schema, every prompt, AND the frontend teammate (FRONTEND_CONTRACT.md). These shapes already match the `/ai-assistant` page.

### Endpoints & request payloads (LOCKED)

| Endpoint | Request | Content-Type |
|---|---|---|
| `POST /api/analyze-resume` | JSON `{resume_text, target_role}` | `application/json` |
| `POST /api/analyze-resume-file` | multipart `file` (PDF ≤5MB) + `target_role` | `multipart/form-data` |
| `POST /api/company-research` | JSON `{company, role}` | `application/json` |
| `POST /api/prep-coach` | JSON `{company, role, round}` | `application/json` |

`round` is the **free-form round name** from the drive's rounds timeline (e.g. `"Technical Round 2 (DSA & System Design)"`), NOT a fixed enum. The frontend passes the drive round name.

### Response `data` shapes — build EXACTLY these (LOCKED)

**Resume Analyzer** (`ResumeReport`) — mirrors frontend `ResumeResult`:
| field | type | notes |
|---|---|---|
| `score` | int | 0–100 overall ATS/role score |
| `summary` | str | 1–2 sentence takeaway |
| `sections` | `[{title, score, feedback, suggestions}]` | per-topic breakdown (e.g. ATS Compatibility, Impact & Metrics, Action Verbs & Writing, Role Alignment) |
| `sections[].title` | str | section heading |
| `sections[].score` | int | 0–100 for that section |
| `sections[].feedback` | str | what's good / wrong |
| `sections[].suggestions` | [str] | actionable fixes |
| `topStrengths` | [str] | positive highlights |
| `criticalFixes` | [str] | must-fix items |

**Company Research** (`CompanyBrief`) — matches frontend `CompanyResult`:
| field | type | notes |
|---|---|---|
| `companyName` | str | echo input, title-cased |
| `role` | str | target role |
| `overview` | str | company overview paragraph |
| `techStack` | [str] | technologies |
| `culture` | str | work culture/values |
| `interviewProcess` | str | round structure |
| `recentNews` | [str] | ~3 recent developments — model says "check [company]'s newsroom" if unsure, DO NOT invent |
| `salaryRange` | str | if unknown: "Varies — check AmbitionBox / Glassdoor", DO NOT invent a number |
| `tips` | [str] | prep tips |

**Prep Coach** (`PrepPlan`) — matches frontend `PrepResult`:
| field | type | notes |
|---|---|---|
| `company` | str | company name |
| `title` | str | round title |
| `description` | str | what the round involves |
| `topics` | `[{name, priority, description}]` | study topics |
| `topics[].name` | str | topic |
| `topics[].priority` | str | "High" / "Medium" / "Low" |
| `topics[].description` | str | what to cover |
| `questionTypes` | [str] | question kinds |
| `resources` | `[{name, url, description}]` | links |
| `resources[].name` | str | resource name |
| `resources[].url` | str | URL |
| `resources[].description` | str | small note |
| `proTips` | [str] | strategic tips |

### Sample success responses (copy these shapes)

`POST /api/company-research` →
```json
{
  "success": true,
  "data": {
    "companyName": "Google",
    "role": "Software Engineer",
    "overview": "Google (Alphabet Inc.) is a multinational technology company...",
    "techStack": ["Python", "Go", "TensorFlow", "Kubernetes", "GCP"],
    "culture": "Engineering-driven culture with emphasis on innovation and data-driven decisions.",
    "interviewProcess": "OA → Phone → 4 Onsite (Coding + System Design + Behavioral)",
    "recentNews": ["...", "...", "..."],
    "salaryRange": "Varies by role & location — check AmbitionBox / Glassdoor",
    "tips": ["...", "..."]
  }
}
```

`POST /api/analyze-resume` →
```json
{
  "success": true,
  "data": {
    "score": 72,
    "summary": "Strong skills section and quantifiable impact, but missing role-aligned keywords.",
    "sections": [
      {
        "title": "ATS Compatibility",
        "score": 68,
        "feedback": "Your resume contains a clearly labeled skills section that ATS systems can parse.",
        "suggestions": [
          "Use standard section headings (Experience, Education, Skills, Projects)",
          "Include keywords from the job description verbatim"
        ]
      }
    ],
    "topStrengths": ["Educational background is clearly documented", "Project experience demonstrates hands-on skills"],
    "criticalFixes": ["Add numbers and metrics to at least 3 bullet points", "Add a dedicated Technical Skills section"]
  }
}
```

`POST /api/prep-coach` →
```json
{
  "success": true,
  "data": {
    "company": "Amazon",
    "title": "Technical Round 2 (DSA & System Design)",
    "description": "45-60 minute interview covering data structures, algorithms, and basic system design.",
    "topics": [
      {"name": "Arrays & Strings", "priority": "High", "description": "Two pointers, sliding window, prefix sums"},
      {"name": "System Design Basics", "priority": "Medium", "description": "API design, database schema, caching"}
    ],
    "questionTypes": ["Live coding with explanation", "Design a URL shortener"],
    "resources": [
      {"name": "LeetCode", "url": "https://leetcode.com", "description": "Practice medium/hard problems"},
      {"name": "System Design Primer", "url": "https://github.com/donnemartin/system-design-primer", "description": "Free system design guide"}
    ],
    "proTips": ["Think out loud — interviewers want to see your thought process", "Start with brute force, then optimize"]
  }
}
```

### Envelope (LOCKED — frontend expects one of these two shapes)

```json
{"success": true, "data": { ...the §5 shape above... }}
{"success": false, "error": {"code": "LLM_FAILED", "message": "..."}}
```

| Situation | HTTP | `error.code` |
|---|---|---|
| Valid input, LLM returned valid JSON | 200 | — |
| Malformed body / bad field types | 422 (automatic) | — |
| LLM call failed (network/timeout) | 502 | `LLM_FAILED` |
| LLM output not recoverable / fails Pydantic validation | 502 | `LLM_INVALID_RESPONSE` |
| PDF unreadable / empty text | 422 | `EMPTY_DOCUMENT` |
| Wrong file type / over 5MB | 422 | `INVALID_FILE_TYPE` / `FILE_TOO_LARGE` |

Implemented by `ok()`/`fail()` in `api/envelope.py`. **The frontend reads `res.data`** — it does `setResult(data)` and then renders `result.score`, `result.techStack`, etc.

**IMPORTANT (read before coding the `/api/prep-coach` route):** the frontend drives with `{company, role, round}` where `round` is a real round name. Keep that. Prep coach responds with `PrepPlan` (§5), NOT the old `{topic_checklist, likely_questions, round_strategy}` shape.

### 5.1 FRONTEND CONNECTION SPEC (how the browser wires to this backend — LOCKED)

> This is the zero-guess wiring guide. Currently the frontend (`app/web/src/app/(dashboard)/ai-assistant/page.tsx`) calls its OWN fake route `POST /api/ai` with a JSON `{action, ...}` body and reads the shape DIRECTLY (`const data = await res.json(); setResult(data)`). The real backend ALSO wraps everything in `{success, data}`. So the frontend must (a) change the fetch URL + field names, and (b) unwrap `.data`.

**Base URL:** the agent server runs at `http://127.0.0.1:8000` (CORS is wide open already — no frontend CORS change needed). Frontend dev server is `:3000`.

**Envelope unwrap + error handling — apply to ALL three:**
```ts
const res = await fetch(`${BASE_URL}/api/<endpoint>`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ <backend fields below> }),
});
const body = await res.json();
if (!body.success) {
  // body = {success:false, error:{code, message}}  → show body.error.message w/ retry
  return;
}
const data = body.data; // <-- the §5 shape; render this
```

**Replacements (old frontend → new):**

| From `/api/ai` action | Endpoint on agent | Field translation |
|---|---|---|
| `resume-analyze` | `POST http://127.0.0.1:8000/api/analyze-resume` | `resumeText`→`resume_text`, `targetRole`→`target_role` |
| `company-research` | `POST http://127.0.0.1:8000/api/company-research` | `companyName`→`company`, `role`→`role` |
| `prep-coach` | `POST http://127.0.0.1:8000/api/prep-coach` | `company`→`company`, `role`→`role`, `roundType`→`round` |

**`roundType` (enum) → `round` (name) mapping — REQUIRED.** The prep tab has a `<select>` with `roundType` values `oa` / `technical` / `hr` / `system-design`. The backend needs a human round NAME:
| frontend `roundType` | send as `round` |
|---|---|
| `oa` | `Online Assessment (OA)` |
| `technical` | `Technical Interview` |
| `hr` | `HR / Behavioral Interview` |
| `system-design` | `System Design Interview` |

**Resume PDF upload (onboarding or resume tab):** use `multipart/form-data`, NOT JSON:
```ts
const fd = new FormData();
fd.append("file", pdfFile);          // a File object, .pdf, ≤5MB
fd.append("target_role", targetRole);
const res = await fetch("http://127.0.0.1:8000/api/analyze-resume-file", { method: "POST", body: fd });
const body = await res.json();
const data = body.data; // ResumeReport (§5)
```

**Context pre-fill (drive detail → AI page):** the two buttons in `app/web/src/app/(dashboard)/drives/[id]/page.tsx` currently `router.push("/ai-assistant")` with NO data. Change them to pass query params so the AI page pre-fills and the student doesn't retype:
```ts
function handleAIPrepCoach() {
  router.push(`/ai-assistant?company=${encodeURIComponent(drive.companyName)}&role=${encodeURIComponent(drive.role)}&round=${encodeURIComponent(drive.rounds?.[0]?.name ?? "Technical Interview")}`);
}
function handleCompanyResearch() {
  router.push(`/ai-assistant?company=${encodeURIComponent(drive.companyName)}&role=${encodeURIComponent(drive.role)}`);
}
```
and the AI page reads them with `useSearchParams()` to pre-fill `companyName`/`prepCompany`/`roundType`/`targetRole`.

**Latency (UX-critical):** real LLM calls take **6–22s** (resume fastest, company/prep slowest). Keep the existing loading states; add `disabled` while loading; do NOT set a client-side fetch timeout under ~30s or the slow calls will fail. Optionally add an abort/retry button.

**How to test after wiring:** run agent on :8000 (`PYTHONPATH= ./venv/Scripts/python.exe -m uvicorn main:app --reload`), frontend on :3000, click the 3 AI tabs. Each must render real LLM content (not the old mock's instant `score: 85`). Company tab must show `companyName/techStack/recentNews/salaryRange`; prep tab must show `topics/questionTypes/proTips`.

---

## 6. Response envelope + status codes (LOCKED)

Every endpoint returns exactly one of:

```json
{"success": true, "data": { ... }}
{"success": false, "error": {"code": "LLM_FAILED", "message": "..."}}
```

| Situation | HTTP status | `error.code` |
|---|---|---|
| Valid input, LLM returned valid JSON | 200 | — |
| Malformed request body / bad field types | 422 (FastAPI automatic) | — |
| LLM call failed (network/timeout) | 502 | `LLM_FAILED` |
| LLM output not recoverable as JSON | 502 | `LLM_INVALID_RESPONSE` |
| PDF unreadable / empty text | 422 | `EMPTY_DOCUMENT` |

`api/envelope.py` implements `ok()` / `fail()`. **Never return a third shape.**

## 7. Hard rules

1. **`app/web` rule:** the AI slice is Mitra's (the `/ai-assistant` page, `app/api/ai/route.ts` mock, AI buttons in `drives/[id]/page.tsx`, onboarding resume upload) — Mitra may edit those. Everything ELSE in `app/web/**` belongs to a teammate — never edit it from this folder.
2. All LLM calls go through `core/llm_client.py` — never raw urllib/requests/httpx inside routers or services.
3. System prompts live in `prompts/*.md`.
4. Never trust raw model output — always `json_utils` → Pydantic validation → envelope.
5. Let the LLM say "I don't know" in its output when info is missing. **No hardcoded fallbacks, no fake data** (the old `score: 85` placeholder is being deleted, not imitated). For factual fields (`salaryRange`, `recentNews`) the prompt MUST tell the model to say "varies — check AmbitionBox / Glassdoor" rather than invent a number.
6. Every change gets a Changelog entry.
7. **Response schemas match §5 exactly** — if you change a field name, update §5 + the schema + the prompt + tell the frontend teammate.

## 8. Running & verifying (commands)

From this repo's `agent/` folder. **Gotcha: if running from the Hermes terminal shell, prefix with `PYTHONPATH=`** (that shell exports a PYTHONPATH pointing at a broken pydantic; plain cmd/PowerShell is unaffected).

```bash
# Server (after venv exists from run.bat)
PYTHONPATH= ./venv/Scripts/python.exe -m uvicorn main:app --reload
# or, in plain cmd:  run.bat

# Swagger UI
# http://127.0.0.1:8000/docs

# Run tests (Phase 3+)
PYTHONPATH= ./venv/Scripts/python.exe -m pytest tests/ -q
```

Env: `.env` already contains `AI_API_KEY`, `AI_BASE_URL=https://opencode.ai/zen/v1`, `AI_MODEL_NAME=deepseek-v4-flash-free`.

> ⚠️ **pytest is NOT yet installed** in `./venv` — Phase 3 must `pip install pytest` first.

---

## 9. Roadmap — Phase plan (execute in order)

> Each phase = one commit + one Changelog line. "Verify" = the exact check that proves the phase is done. **Do not start a phase before its prerequisites are committed.**

### Phase 0 — Foundation: make the server actually call the LLM — ✅ DONE

**Prerequisite:** none. **Files:** `config.py`, `core/llm_client.py`, `core/json_utils.py`. **Status: complete and verified — do not rework.**

**Verify (re-run to confirm):**
```bash
PYTHONPATH= ./venv/Scripts/python.exe -c "from core.json_utils import extract_json; print(extract_json('\"\`\`\`json\n{\\\"a\\\": 1}\n\"\`\`\`'))"
# → {'a': 1}
PYTHONPATH= ./venv/Scripts/python.exe -c "from core.llm_client import chat; print(chat('Reply with the word OK', 'hello')[:50])"
# → real model output, not an error
```

---

### Phase 1 — Resume Analyzer (text + PDF) — ROUTES DONE, **SCHEMA RE-ALIGN TO §5**

**Prerequisite:** Phase 0 committed. **Files:** `api/envelope.py` ✅, `services/resume_service.py` ✅ (function `analyze_resume`), `api/routers/resume.py` ✅, `main.py` ✅, `core/file_utils.py` ✅, `requirements.txt` ✅.

The routes/services already exist and work. **The only remaining work is re-aligning the response shape to §5** (the frontend contract). If the schema/prompt already match §5, this phase is done.

Steps:
1. `api/schemas/resume.py` — `ResumeReport` MUST be: `score: int` (0–100), `summary: str`, `sections: list[ResumeSection]` where `ResumeSection` = `{title: str, score: int, feedback: str, suggestions: list[str]}`, `topStrengths: list[str]`, `criticalFixes: list[str]`. Keep `ResumeRequest {resume_text, target_role}`.
2. `prompts/resume.md` — instruct the model to emit **exactly** the §5 keys (`score`, `summary`, `sections[]`, `topStrengths`, `criticalFixes`) with a sample JSON block. `topStrengths` and `criticalFixes` are camelCase — the model must output those exact key names.
3. Keep both routes (`/api/analyze-resume` + `/api/analyze-resume-file`). Router error → envelope mapping stays.

**Verify:** server running → Swagger `/docs`:
- `POST /api/analyze-resume` with `{"resume_text": "Built full stack React node app...", "target_role": "SDE"}` → `{"success": true, "data": {score, summary, sections, topStrengths, criticalFixes}}` with real LLM content (not 85).
- `POST /api/analyze-resume-file` with a real PDF → same shape. With a blank/scanned PDF → 422 `EMPTY_DOCUMENT`.

**Locked:** envelope shape, schema names (§5), empty-doc → 422. **Your discretion:** sync vs async httpx, prompt wording tweaks in `prompts/resume.md`. **Cut if rushed:** file route. **Pitfalls:** `python-multipart` required or UploadFile 500s; keep `analyze_resume()` pure — parsing happens in the router/file_utils, not inside the service.

---

### Phase 2 — Company Research + Prep Coach — ROUTES DONE, **SCHEMA RE-ALIGN TO §5**

**Prerequisite:** Phase 1 committed. **Files:** `services/company_service.py` ✅ (`research_company`), `services/coach_service.py` ✅ (`generate_prep_plan`), `api/routers/company.py` ✅, `api/routers/coach.py` ✅, `main.py` ✅.

The routes/services already exist and work. **Remaining work is re-aligning the response shapes to §5.**

Steps:
1. `api/schemas/company.py` — `CompanyBrief` MUST be: `companyName: str`, `role: str`, `overview: str`, `techStack: list[str]`, `culture: str`, `interviewProcess: str`, `recentNews: list[str]`, `salaryRange: str`, `tips: list[str]`. Keep `CompanyRequest {company, role}`.
2. `api/schemas/coach.py` — `PrepPlan` MUST be: `company: str`, `title: str`, `description: str`, `topics: list[PrepTopic]` (`{name, priority, description}`), `questionTypes: list[str]`, `resources: list[PrepResource]` (`{name, url, description}`), `proTips: list[str]`. Keep `CoachRequest {company, role, round}`.
3. `prompts/company.md` — model emits exactly `companyName, role, overview, techStack, culture, interviewProcess, recentNews, salaryRange, tips` (sample JSON block in the prompt). Anti-fabrication: `recentNews`/`salaryRange` → "check ..." if unsure (rule §7.5).
4. `prompts/coach.md` — model emits exactly `company, title, description, topics[{name,priority,description}], questionTypes, resources[{name,url,description}], proTips` (sample JSON block in the prompt).

**Verify (Swagger):**
- `POST /api/company-research` `{"company": "Google", "role": "SDE"}` → §5 `CompanyBrief` shape.
- `POST /api/prep-coach` `{"company": "Amazon", "role": "SDE-1", "round": "Technical Round 2 (DSA & System Design)"}` → §5 `PrepPlan` with nested objects, not prose blobs.

**Locked:** schema field names (§5), anti-fabrication. **Cut if rushed:** prep coach first if you must pick. **Pitfalls:** model occasionally returns prose instead of JSON — json_utils + validation catches it; if a list comes back as a string, Pydantic rejects it (good) — surface `LLM_INVALID_RESPONSE`, don't silently coerce.

---

### Phase 3 — Robustness + tests (demo-proofing) — INCOMPLETE

**Prerequisite:** Phase 2 committed. **Files:** `tests/test_json_utils.py`, `tests/test_endpoints.py` (currently empty TODO files), `.env.example`, `README.md`, `requirements.txt`.

Steps:
1. `pip install pytest` into `./venv`.
2. `tests/test_json_utils.py` — real unit tests: fence stripping, prose-wrapped JSON, trailing-comma repair, garbage input → raises `JSONExtractionError`.
3. `tests/test_endpoints.py` — FastAPI `TestClient`; monkeypatch `core.llm_client.chat` to return fixed §5-shaped JSON; assert `{success, data}` envelope + §5 schema; assert 422 on bad body; assert 502 envelope on client raise.
4. Logging — one line per call: endpoint, http status, latency_ms, model. (stdlib `logging`; only `llm_client` logs today.)
5. Fix stale files: `.env.example` → `AI_API_KEY=...` (not Anthropic); `requirements.txt` → already clean (httpx, pypdf, python-multipart; no anthropic) — double-check; `README.md` → match reality (opencode zen, not Anthropic).
6. Delete or archive `test.py` (its job is now `tests/`). Keep `tests/test_endpoints_live.py` as an optional manual real-LLM check.
7. **PRE-FRONTEND FIXES (MUST be done + verified before connecting to the frontend — Phase 4 gate).** Three latent bugs found in review:
   - **`tests/test_endpoints_live.py` reads OLD field names** → will crash with `KeyError` against the §5 schemas. Lines 48 & 64 must be:
     ```python
     # line 48 (was data_company["data"]["tech_stack"])
     len(data_company["data"]["techStack"]),
     # line 64 (was data_coach["data"]["topic_checklist"])
     len(data_coach["data"]["topics"]),
     ```
   - **`services/*_service.py` fallback prompts (lines ~15-18) still describe the OLD contract** — used only when `prompts/*.md` is missing, but then the LLM emits old-shape JSON → 502. Must be replaced with §5 keys:
     ```python
     # resume_service.py fallback →
     "score (0-100), summary (str), sections (list of {title, score, feedback, suggestions}), topStrengths (list), criticalFixes (list)."
     # company_service.py fallback →
     "companyName, role, overview, techStack (list), culture, interviewProcess, recentNews (list), salaryRange, tips (list)."
     # coach_service.py fallback →
     "company, title, description, topics (list of {name, priority, description}), questionTypes (list), resources (list of {name, url, description}), proTips (list)."
     ```
   - **`core/llm_client.py` retry tuple ends with bare `Exception` (line 78)** → the `LLMError("Unexpected response format...")` raised at line 72 gets caught as transient, retried pointlessly, and its specific message is lost. Narrow the tuple to:
     ```python
     except (
         httpx.TimeoutException,
         httpx.NetworkError,
         httpx.HTTPStatusError,
     ) as exc:
     ```
   - Optional (recommended): `main.py` log line hardcodes the model name — use `AI_MODEL_NAME` from `config.py` instead; add `pytest>=8.0.0` to `requirements.txt` so a fresh `run.bat` venv can still run tests.

**Verify:** `PYTHONPATH= ./venv/Scripts/python.exe -m pytest tests/ -q` → all pass. Kill network / point client at a dead URL → endpoint returns clean 502 envelope, no traceback. Then run `PYTHONPATH= ./venv/Scripts/python.exe tests/test_endpoints_live.py` against the real API → prints `[SUCCESS] ALL FASTAPI ENDPOINTS ARE FULLY FUNCTIONAL!` with the NEW field names (techStack/topics), no KeyError.

**Locked:** status-code mapping, no OCR, no new heavy deps. **Cut if rushed:** tests (step 2–3) are the most skippable — but json_utils tests are cheap insurance for demo day.

---

### Phase 4 — Wire frontend → backend (AI works end-to-end) — THE CONNECTION PHASE

**Prerequisite:** Phase 2 or 3 committed. **Goal: the `/ai-assistant` page and drive-detail buttons talk to THIS backend. Real LLM responses in the browser. No mock anywhere in the AI path.**

**Ownership: the AI slice is Mitra's** — `app/web/src/app/(dashboard)/ai-assistant/page.tsx`, `app/web/src/app/api/ai/route.ts` (the mock — DELETE it), the AI buttons in `app/web/src/app/(dashboard)/drives/[id]/page.tsx`, and the onboarding resume upload. Everything else in `app/web` stays the teammate's. All wiring below is done by Mitra using §5.1 (the zero-guess spec).

Steps:
1. **Delete the mock** `app/web/src/app/api/ai/route.ts` — nothing may call `/api/ai` after this phase. If a grep still finds `/api/ai` fetches, they must be replaced (the only callers today are the 3 handlers in `ai-assistant/page.tsx` lines ~84–135).
2. **Replace the 3 handlers** in `app/web/src/app/(dashboard)/ai-assistant/page.tsx` per §5.1:
   - `handleResumeAnalyze` → `POST http://127.0.0.1:8000/api/analyze-resume` body `{resume_text, target_role}` → `setResumeResult(body.data)`
   - `handleCompanyResearch` → `POST http://127.0.0.1:8000/api/company-research` body `{company, role}` → `setCompanyResult(body.data)`
   - `handlePrepCoach` → `POST http://127.0.0.1:8000/api/prep-coach` body `{company, role, round}` where `round` = the §5.1 `roundType`→name mapping → `setPrepResult(body.data)`
   - Every handler: unwrap `.data`, check `body.success` first, `console.error(body.error?.message)` on failure, keep `set*Loading` in `finally`.
3. **Resume upload:** make the file input in the resume tab (and/or onboarding) call `POST http://127.0.0.1:8000/api/analyze-resume-file` with `FormData {file, target_role}` (PDF ≤5MB). Keep the paste-text path as fallback. Do NOT read PDFs with `FileReader.readAsText` (garbles binary) — send the File object itself.
4. **Drive-detail buttons** (`drives/[id]/page.tsx` `handleAIPrepCoach`/`handleCompanyResearch`): `router.push` with `?company=&role=&round=` query params (§5.1 context pre-fill); `ai-assistant/page.tsx` reads them with `useSearchParams()` to pre-fill `companyName`/`prepCompany`/`roundType`/`targetRole`.
5. **UX:** keep loading spinners (real calls take 6–22s), no client fetch timeout <30s, disable the button while loading.
6. Demo rehearsal: onboard → resume scored → drive detail → company brief → apply → applications → prep coach for next round.

**Verify (the whole point of this phase):** backend on :8000 (`PYTHONPATH= ./venv/Scripts/python.exe -m uvicorn main:app --reload`), frontend on :3000 (`npm run dev`). In the browser: paste a resume → **real** score/sections/strengths render (not the mock's instant `score: 85`); company research → real `companyName/techStack/recentNews/salaryRange`; prep coach → real `topics/questionTypes/proTips`; drive-detail buttons land pre-filled. Also test an empty resume → graceful error, no blank screen.

**Locked:** contract field names (§5), connection spec (§5.1). **Cut if rushed:** step 4 (drive buttons) and step 6 (rehearsal) — but the 3 tabs MUST work end-to-end.

---

## 10. Current status

- [x] Phase 0: config.py, llm_client.py, json_utils.py (Foundation verified)
- [x] Phase 1: envelope, resume service+router, main.py wiring, PDF endpoint (`pypdf` + `python-multipart`) — **schema aligned (Complete)**
- [x] Phase 2: company + coach services/routers — **schema aligned (Complete)**
- [x] **Schema + prompts re-aligned to §5 (frontend contract)** — resume/company/coach response shapes
- [x] Phase 3: tests, logging, stale-file cleanup (README/.env.example/test.py), pytest installed
- [x] **Pre-frontend fixes (Phase 3 step 7):** live-test keys (`techStack`/`topics`), service fallback prompts → §5, `llm_client.py` except-tuple narrow — ALL APPLIED + verified via pytest/live test ✅
- [x] **§5.1 FRONTEND CONNECTION SPEC added** — exact fetch replacements, field translation, envelope unwrap, `roundType`→`round` mapping, FormData upload, context pre-fill
- [x] Phase 4: **CONNECTION PHASE (Mitra owns AI slice)** — delete `/api/ai` mock, wire 3 tabs in `ai-assistant/page.tsx`, PDF upload, drive buttons pre-fill, end-to-end verify

## Changelog

| Date | Change | Author |
|---|---|---|
| 2026-08-04 | Initial scaffold: `api/` `core/` `services/` `prompts/` `tests/` + this file. Architecture decision recorded: per-endpoint services, no central agent. | Mitra |
| 2026-08-04 | Added §9 Roadmap (Phases 0–4) with per-phase steps, verification, locked decisions, pitfalls. Envelope/status-code spec (§6). | Mitra |
| 2026-08-04 | Implemented Phase 0 Foundation: `config.py`, `core/llm_client.py` (httpx with retry & timeout), `core/json_utils.py` (fence stripping & repair). Verified live LLM response. | Antigravity |
| 2026-08-04 | Implemented Phase 1 & Phase 2: `api/envelope.py`, `core/file_utils.py` (PDF extraction), `services/*`, `api/routers/*` (Resume, Company, Prep Coach), mounted in `main.py`. | Antigravity |
| 2026-08-04 | Aligned §5 contract to the frontend `/ai-assistant` shapes (rich `ResumeReport`/`CompanyBrief`/`PrepPlan`). Marked schemas + prompts for re-alignment to §5. | Mitra |
| 2026-08-04 | Verified Phase 1 (Resume Analyzer). Schemas and prompts already align with §5 perfectly. Marked Phase 1 as officially complete. | Antigravity |
| 2026-08-04 | Verified Phase 2 (Company Research, Prep Coach). Updated `CompanyBrief` and `PrepPlan` schemas and prompts to exactly match §5 (camelCase fields, structured topics). Marked Phase 2 as officially complete. | Antigravity |
| 2026-08-04 | Implemented Phase 3 (Robustness & Tests). Added pytest unit tests and endpoint tests. Added HTTP request logging to `main.py`. Cleaned up `test.py`, `.env.example`, and `README.md` to reflect DeepSeek usage. | Antigravity |
| 2026-08-04 | Added Phase 3 step 7 PRE-FRONTEND FIXES (Phase 4 gate): live-test `techStack`/`topics` key fix, §5 fallback prompts in services, `llm_client.py` except-tuple narrowing — from full codebase review pass. | Mitra |
| 2026-08-04 | Added §5.1 FRONTEND CONNECTION SPEC (zero-guess wiring guide): envelope unwrap, field-translation table, `roundType`→`round` mapping, FormData upload, drive-detail context pre-fill, latency/UX notes. Phase 4 now references §5.1 (FRONTEND_CONTRACT.md optional). | Mitra |
| 2026-08-04 | Phase 4 redefined as THE CONNECTION PHASE: Mitra owns the AI slice of `app/web` (ai-assistant page, `/api/ai` mock → DELETE, AI drive buttons, onboarding upload). Hard rule #1 updated accordingly. Phase 4 now = wire 3 tabs + PDF upload + drive pre-fill + end-to-end verify, not "hand off to teammate". | Mitra |
| 2026-08-04 | Implemented Phase 4 (Connection Phase). Wired AI Assistant page to use the real FastAPI backend on port 8000. Replaced `/api/ai` fetches with real backend endpoints. Handled `.pdf` file uploads with `FormData`. Prefilled search queries from Drive Detail page buttons. Deleted the mock frontend route. | Antigravity |
