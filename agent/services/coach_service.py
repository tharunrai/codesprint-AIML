"""Round-wise prep coaching logic.

TODO: implement coach(company, role, round) -> PrepPlan
  1. load prompts/coach.md as system prompt
  2. build user message from company + role + round
  3. call core.llm_client
  4. parse with core.json_utils, validate against PrepPlan
"""
