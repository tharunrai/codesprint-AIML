"""Parse and repair LLM JSON outputs cleanly.

Never trust raw model text — LLMs often wrap JSON in markdown code fences
or add prose before/after the JSON block.
"""

import json
import re


class JSONExtractionError(ValueError):
    """Raised when valid JSON cannot be extracted from LLM text."""

    pass


def extract_json(text: str) -> dict:
    """Extract and parse a JSON dictionary from raw model text response.

    Strips markdown code fences (```json ... ``` or ``` ... ```) and isolates
    the primary JSON object block.

    Args:
        text: Raw text string from the LLM.

    Returns:
        dict: Parsed JSON dictionary.

    Raises:
        JSONExtractionError: If no valid JSON object can be parsed.
    """
    if not text or not isinstance(text, str):
        raise JSONExtractionError("Empty or invalid response received from LLM.")

    cleaned_text = text.strip()

    # Step 1: Strip markdown code block fences if present
    fence_pattern = r"^```(?:json)?\s*\n?(.*?)\n?```$"
    match = re.search(fence_pattern, cleaned_text, re.DOTALL | re.IGNORECASE)
    if match:
        cleaned_text = match.group(1).strip()

    # Step 2: Extract object block starting with '{' and ending with '}'
    start_idx = cleaned_text.find("{")
    end_idx = cleaned_text.rfind("}")

    if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
        json_candidate = cleaned_text[start_idx : end_idx + 1]
    else:
        json_candidate = cleaned_text

    # Step 3: Parse JSON
    try:
        data = json.loads(json_candidate)
        if isinstance(data, dict):
            return data
        raise JSONExtractionError(
            f"Extracted JSON is a {type(data).__name__}, expected a dict."
        )
    except json.JSONDecodeError as err:
        # Fallback: Attempt trailing comma fix
        try:
            repaired = re.sub(r",\s*([\]}])", r"\1", json_candidate)
            data = json.loads(repaired)
            if isinstance(data, dict):
                return data
        except Exception:
            pass

        raise JSONExtractionError(
            f"Failed to parse LLM response as JSON: {err}. Raw text: '{text[:200]}'"
        ) from err
