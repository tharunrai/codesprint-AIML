"""The ONLY place that talks to the LLM.

TODO: port the working client from test.py into here:
  - read config from config.py (base_url, api_key, model)
  - use `openai` SDK (OpenAI-compatible, set base_url) or httpx — drop raw urllib
  - timeout (~45s) + retry (2x on transient failure)
  - try response_format={"type": "json_object"} if the provider supports it;
    fall back to prompt-enforced JSON otherwise (json_utils handles both)
"""
