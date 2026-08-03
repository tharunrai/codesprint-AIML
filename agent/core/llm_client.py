"""Central LLM Client module.

This is the ONLY place in the codebase that makes requests to the LLM API.
Uses httpx for efficient, robust HTTP execution with timeout and retries.
"""

import logging
import time
import httpx
from config import (
    AI_API_KEY,
    AI_BASE_URL,
    AI_MODEL_NAME,
    LLM_MAX_RETRIES,
    LLM_TIMEOUT,
)

logger = logging.getLogger("agent.llm_client")


class LLMError(Exception):
    """Raised when the LLM API request fails after retries."""

    pass


def chat(system_prompt: str, user_prompt: str) -> str:
    """Send a chat completion request to the OpenAI-compatible LLM endpoint.

    Args:
        system_prompt: System prompt instructions.
        user_prompt: User input prompt.

    Returns:
        str: Raw text content from the LLM choice response.

    Raises:
        LLMError: If network request fails, times out, or returns error status.
    """
    if not AI_API_KEY:
        raise LLMError("AI_API_KEY is not configured in environment.")

    url = f"{AI_BASE_URL.rstrip('/')}/chat/completions"
    headers = {
        "Authorization": f"Bearer {AI_API_KEY.strip()}",
        "Content-Type": "application/json",
        "User-Agent": "Placement-Portal-Agent/1.0",
    }
    payload = {
        "model": AI_MODEL_NAME,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": 0.2,
    }

    last_error = None
    max_attempts = LLM_MAX_RETRIES + 1

    for attempt in range(1, max_attempts + 1):
        try:
            with httpx.Client(timeout=LLM_TIMEOUT) as client:
                response = client.post(url, headers=headers, json=payload)
                response.raise_for_status()
                data = response.json()

                if "choices" in data and len(data["choices"]) > 0:
                    content = data["choices"][0]["message"]["content"]
                    return content
                else:
                    raise LLMError(f"Unexpected response format from LLM: {data}")

        except (
            httpx.TimeoutException,
            httpx.NetworkError,
            httpx.HTTPStatusError,
            Exception,
        ) as exc:
            last_error = exc
            logger.warning(f"LLM call attempt {attempt}/{max_attempts} failed: {exc}")
            if attempt < max_attempts:
                time.sleep(1.0 * attempt)

    raise LLMError(
        f"LLM API request failed after {max_attempts} attempts: {last_error}"
    ) from last_error
