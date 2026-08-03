# AI Agent Backend — AGENTS.md

> Single source of truth for the AI backend of the CodeSprint PS-1 Placement Portal.
> **Rule: EVERY change to this folder must be logged in the [Changelog](#changelog) at the bottom. No changelog entry = the change doesn't exist.**

## 1. What this is

Python **FastAPI** backend that powers the 3 AI features of the placement portal (specs.md §4.5):

1. **Resume Analyzer** — scores a resume against a target role
2. **Company Research Assistant** — generates a company + role briefing
3. **Round-wise Prep Coach** — prep plan for the student's current round

The LLM is **DeepSeek (`deepseek-v4-flash-free`)** served via **opencode zen** — an OpenAI-compatible API.
We do **NOT** use the Anthropic SDK. (`agent/README.md` and `.env.example` still mention Anthropic — they are STALE, ignore them.)

## 2. Architecture decision (recorded — don't silently change it)

**Pattern: per-endpoint LLM calls through a service layer. NOT a central agent with tools.**

Why:
- All 3 features are single-shot "input → JSON output" tasks. No multi-step reasoning, no memory, no tool actions.
- A tool-using agent adds orchestration complexity with zero benefit for a 1-day demo.

Revisit ONLY if a feature needs live data or multi-step work (e.g. company research fetching real news, prep coach querying an alumni interview repo) → add a *tool* inside that feature's service then, not a central agent.

## 3. File map

| Path | Responsibility |
|---|---|
| `main.py` | FastAPI app: CORS, health, mounts routers. Keep it thin. |
| `config.py` | All env config (API key, base URL, model, timeouts) read once. |
| `api/routers/*.py` | One router per feature. Only: validate request → call service → return response. No LLM logic here. |
| `api/schemas/*.py` | Pydantic request/response models — THE API contract. |
| `core/llm_client.py` | The ONLY place that talks to the model. Timeout, retries, JSON mode. |
| `core/json_utils.py` | Parse/repair LLM JSON output (strip fences, recover from junk). |
| `services/*_service.py` | Business logic per feature: load prompt, build messages, call client, validate output. |
| `prompts/*.md` | System prompts as files. Never inline long prompts in Python. |
| `tests/` | pytest. Unit-test json_utils; endpoint tests with a mocked client. |
| `test.py` | Legacy manual test script — to be replaced by `tests/`. |

## 4. Data flow (one request)

```
POST /api/<feature>
  → api/routers/<feature>.py        validate body (Pydantic schema)
  → services/<feature>_service.py   load prompts/<feature>.md, build messages
  → core/llm_client.py              call DeepSeek (OpenAI-compatible), timeout + retry
  → core/json_utils.py              strip ```fences → json.loads → repair
  → validate against response schema
  → return {success: true, data}  |  {success: false, error: {code, message}}
```

## 5. API contract (v1)

| Endpoint | Request body | Response `data` |
|---|---|---|
| `POST /api/analyze-resume` | `{resume_text, target_role}` | `{score, formatting_issues[], missing_skills[], improved_bullets[]}` |
| `POST /api/company-research` | `{company, role}` | `{company_overview, tech_stack[], domain_focus, interview_pattern}` |
| `POST /api/prep-coach` | `{company, role, round}` | `{topic_checklist[], likely_questions[], round_strategy}` |

Every response: `{success: true, data: {...}}` on OK, `{success: false, error: {code, message}}` on failure. Frontend teammate wires the two `alert()` stubs in `app/web/src/app/(dashboard)/drives/[id]/page.tsx` to these endpoints.

## 6. Hard rules

1. **Never** modify `app/web/**` from this folder — the frontend is a separate workspace owned by a teammate.
2. All LLM calls go through `core/llm_client.py` — never raw urllib/requests inside routers or services.
3. System prompts live in `prompts/*.md`.
4. Never trust raw model output — always `json_utils` → Pydantic validation → error envelope.
5. Let the LLM say "I don't know" in its output when info is missing. No hardcoded fallbacks.
6. Every change gets a Changelog entry (see bottom).

## 7. Adding a new AI feature (do in this order)

1. `prompts/<name>.md` — system prompt + required output JSON schema
2. `api/schemas/<name>.py` — request/response models
3. `services/<name>_service.py` — load prompt, call client, validate output
4. `api/routers/<name>.py` — endpoint
5. Mount router in `main.py`
6. Test (pytest + one real call)
7. **Add a Changelog entry**

## 8. Running

- `run.bat` — creates venv, installs deps, starts uvicorn on `http://127.0.0.1:8000`
- Manually: `venv\Scripts\activate && uvicorn main:app --reload`
- Swagger UI: `http://127.0.0.1:8000/docs`

## 9. Env vars (`agent/.env`)

| Var | Purpose |
|---|---|
| `AI_API_KEY` | opencode zen API key |
| `AI_BASE_URL` | `https://opencode.ai/zen/v1` |
| `AI_MODEL_NAME` | `deepseek-v4-flash-free` |

## 10. Current status / TODOs

- [x] Scaffold structure (folders + stubs + this doc)
- [ ] Port working client from `test.py` → `core/llm_client.py` (use `openai` SDK or `httpx`, drop raw urllib)
- [ ] Implement `core/json_utils.py` — fence stripping + JSON repair
- [ ] Implement `config.py` — central env config
- [ ] Implement `services/*` + `api/routers/*` (3 endpoints)
- [ ] Wire routers into `main.py`; delete hardcoded placeholder in `/api/analyze-resume`
- [ ] Replace `test.py` with real pytest in `tests/`
- [ ] Sync `requirements.txt` (add openai/httpx, drop anthropic)

## Changelog

| Date | Change | Author |
|---|---|---|
| 2026-08-04 | Initial scaffold: `api/` `core/` `services/` `prompts/` `tests/` + this file. Architecture decision recorded: per-endpoint services, no central agent. | Mitra |
