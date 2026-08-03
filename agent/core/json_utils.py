"""Parse + repair LLM JSON output. Never trust the model's raw text.

TODO: implement:
  - strip ```json ... ``` fences (and ``` with no language tag)
  - find first { ... } block if the model added prose around it
  - json.loads with error tolerance (fix trailing commas, single quotes if safe)
  - raise a clear error if no valid JSON can be recovered
"""
