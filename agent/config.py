"""Centralized Configuration Module.

All environment variables and application settings are loaded here.
Never scatter os.getenv() calls across the codebase.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from agent root directory
BASE_DIR = Path(__file__).resolve().parent
ENV_FILE = BASE_DIR / ".env"
load_dotenv(dotenv_path=ENV_FILE)

# LLM Provider Configuration
AI_API_KEY: str = os.getenv("AI_API_KEY", "")
AI_BASE_URL: str = os.getenv("AI_BASE_URL", "https://opencode.ai/zen/v1")
AI_MODEL_NAME: str = os.getenv("AI_MODEL_NAME", "deepseek-v4-flash-free")

# Timeout and Retry Parameters
LLM_TIMEOUT: float = float(os.getenv("LLM_TIMEOUT", "25.0"))
LLM_MAX_RETRIES: int = int(os.getenv("LLM_MAX_RETRIES", "1"))
