import os
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
CHARACTER_FILE = PROJECT_ROOT / "character.md"

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")
OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL", "https://api.deepseek.com/v1")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "deepseek-chat")
