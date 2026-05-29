import json
from datetime import datetime, date
from pathlib import Path
from typing import List, Dict
from .config import MEMORY_DIR

CONVERSATION_FILE = MEMORY_DIR / "conversations.json"
SUMMARY_FILE = MEMORY_DIR / "today_summary.json"


def load_conversations() -> List[Dict]:
    if CONVERSATION_FILE.exists():
        with open(CONVERSATION_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


def save_conversations(messages: List[Dict]):
    with open(CONVERSATION_FILE, "w", encoding="utf-8") as f:
        json.dump(messages, f, ensure_ascii=False, indent=2)


def append_message(role: str, content: str, messages: List[Dict]):
    now = datetime.now().isoformat()
    entry = {"role": role, "content": content, "timestamp": now}
    messages.append(entry)
    save_conversations(messages)


def load_today_summary() -> str:
    today = date.today().isoformat()
    if SUMMARY_FILE.exists():
        data = json.loads(SUMMARY_FILE.read_text(encoding="utf-8"))
        if data.get("date") == today:
            return data.get("summary", "")
    return ""


def save_today_summary(summary: str):
    data = {"date": date.today().isoformat(), "summary": summary}
    SUMMARY_FILE.write_text(
        json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8"
    )


def get_recent_context(messages: List[Dict], max_turns: int = 20) -> List[Dict]:
    recent = []
    for m in reversed(messages):
        if len(recent) >= max_turns:
            break
        recent.insert(0, {"role": m["role"], "content": m["content"]})
    return recent
