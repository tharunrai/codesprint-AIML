"""Resume analysis logic.

TODO: implement analyze(resume_text, target_role) -> ResumeReport
  1. load prompts/resume.md as system prompt
  2. build user message from resume_text + target_role
  3. call core.llm_client
  4. parse with core.json_utils, validate against ResumeReport
  5. let the model say "I don't know" — no hardcoded fallbacks
"""
