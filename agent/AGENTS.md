# AI Agent Backend — AGENTS.md

> Single source of truth for the AI backend of the CodeSprint PS-1 Placement Portal.
> **Rule: EVERY change to this folder must be logged in the [Changelog](#changelog) at the bottom. No changelog entry = the change doesn't exist.**

---

## 0. How to use this file (READ THIS FIRST, AI agents included)

- This file is the **contract** between every human and AI agent working on `agent/`.
- If you are an AI coding agent (Claude Code, Cursor, Copilot, etc.): read the whole file before touching anything. The **Roadmap (§12)** is the plan — execute phases **in order**, one at a time, and stop at the end of each phase to verify + commit.
- **Never guess.** Every decision that matters is recorded below (§2, §6, §12 per-phase "Locked"). If a step is unclear, look at the referenced file before inventing behavior.
- If you are told to implement a phase, do **only** that phase's steps. No unrelated refactors, no "improvements" outside the scope.
- After any change: update **§13 Current Status** and append a **Changelog** line. Commit with a message naming the phase.

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
| `main.py` | FastAPI app: CORS, health, mounts routers. Keep thin. | 🔧 placeholder to replace (Phase 1–2) |
| `config.py` | All env config (key, base URL, model, timeouts) read once. | 🟡 stub (Phase 0) |
| `api/routers/*.py` | One router per feature: validate → service → respond. | 🟡 stubs (Phase 1–2) |
| `api/schemas/*.py` | Pydantic request/response models — THE contract. | ✅ done |
| `api/envelope.py` | `ok()` / `fail()` response envelope helpers. | ❌ create (Phase 1) |
| `core/llm_client.py` | The ONLY place that talks to the model. Timeout, retries. | 🟡 stub (Phase 0) |
| `core/json_utils.py` | Parse/repair LLM JSON output. | 🟡 stub (Phase 0) |
| `core/file_utils.py` | PDF text extraction (pypdf). | ❌ create (Phase 1) |
| `services/*_service.py` | Business logic per feature: prompt → client → validate. | 🟡 stubs (Phase 1–2) |
| `prompts/*.md` | System prompts as files. Never inline long prompts in Python. | ✅ drafted, refine as needed |
| `tests/` | pytest — unit tests (json_utils) + endpoint tests (mocked client). | 🟡 placeholders (Phase 3) |
| `test.py` | Legacy manual test script. | 🔧 replaced by tests/ (Phase 3) |

## 4. Data flow (one request)

```
POST /api/<feature>
  → api/routers/<feature>.py        validate body (Pydantic schema)
  → services/<feature>_service.py   load prompts/<feature>.md, build messages
  → core/llm_client.py              call DeepSeek (OpenAI-compatible), timeout + retry
  → core/json_utils.py              strip fences → json.loads → repair
  → validate against response schema
  → return {success: true, data}  |  {success: false, error: {code, message}}
```

## 5. API contract (v1 — LOCKED)

| Endpoint | Request | Response `data` |
|---|---|---|
| `POST /api/analyze-resume` | JSON `{resume_text, target_role}` | `{score, formatting_issues[], missing_skills[], improved_bullets[]}` |
| `POST /api/analyze-resume-file` | multipart `file` (PDF ≤5MB) + `target_role` | same as above |
| `POST /api/company-research` | JSON `{company, role}` | `{company_overview, tech_stack[], domain_focus, interview_pattern}` |
| `POST /api/prep-coach` | JSON `{company, role, round}` | `{topic_checklist[], likely_questions[], round_strategy}` |

Field names map 1:1 to `api/schemas/*.py`. **Do not rename schema fields** — frontend teammate depends on them.

Example (company-research):
```json
{
  "success": true,
  "data": {
    "company_overview": "...",
    "tech_stack": ["Python", "Go", "Kubernetes"],
    "domain_focus": "payments infrastructure",
    "interview_pattern": "OA → technical → system design → HR"
  }
}
```

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

Implement `ok()`/`fail()` in `api/envelope.py` (Phase 1) and reuse everywhere. Frontend handles exactly these two shapes.

## 7. Hard rules

1. **Never** modify `app/web/**` from this folder — frontend is a separate workspace owned by a teammate.
2. All LLM calls go through `core/llm_client.py` — never raw urllib/requests/httpx inside routers or services.
3. System prompts live in `prompts/*.md`.
4. Never trust raw model output — always `json_utils` → Pydantic validation → envelope.
5. Let the LLM say "I don't know" in its output when info is missing. **No hardcoded fallbacks, no fake data** (the old `score: 85` placeholder is being deleted, not imitated).
6. Every change gets a Changelog entry.

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

---

## 9. Roadmap — Phase plan (execute in order)

> Each phase = one commit + one Changelog line. "Verify" = the exact check that proves the phase is done. **Do not start a phase before its prerequisites are committed.**

### Phase 0 — Foundation: make the server actually call the LLM

**Prerequisite:** none. **Files:** `config.py`, `core/llm_client.py`, `core/json_utils.py`.

Steps:
1. `config.py` — module-level settings object reading `AI_API_KEY`, `AI_BASE_URL`, `AI_MODEL_NAME`, plus `LLM_TIMEOUT=45`, `LLM_MAX_RETRIES=2` from env. Single source of truth.
2. `core/llm_client.py` — port the working call from `test.py` (it already proves the endpoint works). Use **httpx** (already installed in venv) or the `openai` SDK — both OpenAI-compatible. Implement: timeout, 1 retry on transient failure, optional `response_format={"type": "json_object"}` if the provider supports it (test it; fall back to prompt-enforced JSON if not). Expose `chat(system_prompt, user_prompt) -> str` (raw content).
3. `core/json_utils.py` — `extract_json(text) -> dict`: strip ```fences (with/without language tag), find first `{...}` block if prose wrapped it, `json.loads`, raise `JSONExtractionError` if unrecoverable.

**Verify:**
```bash
PYTHONPATH= ./venv/Scripts/python.exe -c "from core.json_utils import extract_json; print(extract_json('\"\`\`\`json\n{\\\"a\\\": 1}\n\"\`\`\`'))"
# → {'a': 1}
PYTHONPATH= ./venv/Scripts/python.exe -c "from core.llm_client import chat; print(chat('Reply with the word OK', 'hello')[:50])"
# → real model output, not an error
```

**Locked:** httpx or openai SDK (either, don't add both). **Cut if rushed:** nothing here — everything depends on it. **Pitfalls:** the PYTHONPATH gotcha above; model may wrap JSON in fences — that's what json_utils is for.

---

### Phase 1 — Resume Analyzer (text + PDF) — the demo star

**Prerequisite:** Phase 0 committed. **Files:** `api/envelope.py`, `services/resume_service.py`, `api/routers/resume.py`, `main.py`, `core/file_utils.py`, `requirements.txt`.

Steps:
1. `api/envelope.py` — `ok(data)` and `fail(code, message, http_status)` returning the envelopes from §6 (use `JSONResponse` for non-200).
2. `services/resume_service.py` — `analyze(resume_text, target_role) -> ResumeReport`: load `prompts/resume.md` as system prompt, build user message, call `llm_client.chat`, `json_utils.extract_json`, validate with `ResumeReport`. Raise typed errors (`LLMError`) on failure.
3. `api/routers/resume.py` — APIRouter with `POST /api/analyze-resume` (body `ResumeRequest`) → `ok(report)`; catch errors → `fail(...)`.
4. `main.py` — **delete the hardcoded `score: 85` placeholder**; import + `include_router` for resume. Keep `/` health and CORS.
5. PDF: `pip install pypdf python-multipart` (and add to `requirements.txt`). `core/file_utils.py` — `extract_pdf_text(data: bytes) -> str` via pypdf. New route `POST /api/analyze-resume-file`: `UploadFile` + `Form target_role`, enforce `.pdf` extension + 5MB cap, extract text; if empty → 422 `EMPTY_DOCUMENT` (scanned PDFs have no text — no OCR, by design).
6. Envelope + error paths wired for both routes.

**Verify:** server running → Swagger `/docs`:
- `POST /api/analyze-resume` with `{"resume_text": "Built full stack React node app...", "target_role": "SDE"}` → `{"success": true, "data": {score, ...}}` with real LLM content (not 85).
- `POST /api/analyze-resume-file` with a real PDF → same shape. With a blank/scanned PDF → 422 `EMPTY_DOCUMENT`.

**Locked:** envelope shape, schema names, empty-doc → 422. **Your discretion:** sync vs async httpx, prompt wording tweaks in `prompts/resume.md`. **Cut if rushed:** steps 5–6 (text-only still demos). **Pitfalls:** `python-multipart` is required or UploadFile 500s; keep `analyze()` pure — parsing happens in the router/file_utils, not inside the service.

---

### Phase 2 — Company Research + Prep Coach

**Prerequisite:** Phase 1 committed. **Files:** `services/company_service.py`, `services/coach_service.py`, `api/routers/company.py`, `api/routers/coach.py`, `main.py`.

Steps:
1. `services/company_service.py` — `research(company, role) -> CompanyBrief`; same pipeline as resume (prompt `prompts/company.md` → client → json_utils → validate).
2. `services/coach_service.py` — `coach(company, role, round) -> PrepPlan`; prompt `prompts/coach.md`.
3. `api/routers/company.py` + `api/routers/coach.py` — same pattern as resume router, envelope + error handling.
4. `main.py` — mount both routers.

**Verify (Swagger):**
- `POST /api/company-research` `{"company": "Google", "role": "SDE"}` → structured `CompanyBrief` JSON.
- `POST /api/prep-coach` `{"company": "Amazon", "role": "SDE-1", "round": "Technical Round 2 (DSA & System Design)"}` → `PrepPlan` with lists, not prose blobs.

**Locked:** none new — copy Phase 1 pattern exactly. **Cut if rushed:** prep coach first if you must pick (frontend already has both buttons; both are ~30 min each). **Pitfalls:** the model occasionally returns prose instead of JSON for round — json_utils + validation catches it; if `likely_questions` comes back as a string, the Pydantic schema rejects it (good) — surface `LLM_INVALID_RESPONSE`, don't silently coerce.

---

### Phase 3 — Robustness + tests (demo-proofing)

**Prerequisite:** Phase 2 committed. **Files:** `tests/test_json_utils.py`, `tests/test_endpoints.py`, `.env.example`, `README.md`, `requirements.txt`.

Steps:
1. Status codes per §6 everywhere (FastAPI gives 422 automatically; map `LLMError` → 502 `LLM_FAILED`, `JSONExtractionError` → 502 `LLM_INVALID_RESPONSE`).
2. Logging — one line per call: endpoint, http status, latency_ms, model. (stdlib `logging` is fine; no new deps.)
3. `tests/test_json_utils.py` — real unit tests: fence stripping, prose-wrapped JSON, trailing-comma repair, garbage input → raises.
4. `tests/test_endpoints.py` — FastAPI `TestClient`; monkeypatch `llm_client.chat` to return fixed JSON; assert envelope + schema; assert 422 on bad body; assert 502 on client raise.
5. Fix stale files: `.env.example` → `AI_API_KEY=...` (not Anthropic); `requirements.txt` → add httpx, pypdf, python-multipart; **remove anthropic**; `README.md` → match reality (opencode zen, not Anthropic).
6. Delete or archive `test.py` (its job is now `tests/`).

**Verify:** `PYTHONPATH= ./venv/Scripts/python.exe -m pytest tests/ -q` → all pass. Kill network / point client at a dead URL → endpoint returns clean 502 envelope, no traceback.

**Locked:** status-code mapping, no OCR, no new heavy deps. **Cut if rushed:** tests (step 3–4) are the most skippable — but json_utils tests are cheap insurance for demo day.

---

### Phase 4 — Frontend handoff + demo rehearsal

**Prerequisite:** Phase 2 or 3 committed. **Deliverable:** `FRONTEND_CONTRACT.md` (new file at `agent/` root).

Steps:
1. Write `FRONTEND_CONTRACT.md` — for the frontend teammate: each endpoint → which page/button → exact payload → how to render (score ring, chips for lists, accordion for briefs) → sample JSON → error handling (show `error.message` with retry). Base it on §5 + §6 of this file.
2. Teammate wires: the two `alert()` stubs in `app/web/src/app/(dashboard)/drives/[id]/page.tsx` (lines ~81–89) → real fetches; onboarding resume upload → `POST /api/analyze-resume-file` (FormData). **Frontend changes are theirs** — you only supply the contract + running server.
3. Demo rehearsal checklist: onboard → resume scored → drive detail → company brief → apply → applications → prep coach for next round.

**Verify:** full journey works in browser against `http://127.0.0.1:8000` (frontend dev server on :3000).

**Locked:** contract field names. **Cut if rushed:** rehearsal (step 3) — but at least click the 3 AI buttons once.

---

## 10. Current status

- [x] Scaffold: `api/` `core/` `services/` `prompts/` `tests/` + this doc
- [x] Schemas (`api/schemas/*.py`) — contract defined
- [x] Prompts drafted (`prompts/*.md`)
- [x] Phase 0: config.py, llm_client.py, json_utils.py (Foundation verified)
- [x] Phase 1: envelope, resume service+router, main.py wiring, PDF endpoint (`pypdf` + `python-multipart`)
- [x] Phase 2: company + coach services/routers (`services/company_service.py`, `services/coach_service.py`, `api/routers/company.py`, `api/routers/coach.py`)
- [ ] Phase 3: tests, status codes, logging, stale-file cleanup
- [ ] Phase 4: FRONTEND_CONTRACT.md + demo rehearsal

## Changelog

| Date | Change | Author |
|---|---|---|
| 2026-08-04 | Initial scaffold: `api/` `core/` `services/` `prompts/` `tests/` + this file. Architecture decision recorded: per-endpoint services, no central agent. | Mitra |
| 2026-08-04 | Added §9 Roadmap (Phases 0–4) with per-phase steps, verification, locked decisions, pitfalls. Envelope/status-code spec (§6). | Mitra |
| 2026-08-04 | Implemented Phase 0 Foundation: `config.py`, `core/llm_client.py` (httpx with retry & timeout), `core/json_utils.py` (fence stripping & repair). Verified live LLM response. | Antigravity |
| 2026-08-04 | Implemented Phase 1 & Phase 2: `api/envelope.py`, `core/file_utils.py` (PDF extraction), `services/*`, `api/routers/*` (Resume, Company, Prep Coach), mounted in `main.py`. | Antigravity |
