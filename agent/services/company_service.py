"""Company research logic.

TODO: implement research(company, role) -> CompanyBrief
  1. load prompts/company.md as system prompt
  2. build user message from company + role
  3. call core.llm_client
  4. parse with core.json_utils, validate against CompanyBrief
"""
