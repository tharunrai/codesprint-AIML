"""Central config — all env vars read once here.

TODO: implement (keep it dead simple, e.g. a module-level settings object):
  AI_API_KEY, AI_BASE_URL, AI_MODEL_NAME, LLM_TIMEOUT, LLM_RETRIES
Never scatter os.getenv() around the codebase.
"""
