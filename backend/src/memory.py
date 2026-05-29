from typing import List, Dict
from .supabase_client import get_conversations_sync


def load_conversations() -> List[Dict]:
    try:
        convs = get_conversations_sync(limit=1000, ascending=True)
        return [
            {
                "role": c["role"],
                "content": c["content"],
                "timestamp": c.get("created_at", ""),
            }
            for c in convs
        ]
    except Exception:
        return []


def get_recent_context(messages: List[Dict], max_turns: int = 20) -> List[Dict]:
    recent = []
    for m in reversed(messages):
        if len(recent) >= max_turns:
            break
        recent.insert(0, {"role": m["role"], "content": m["content"]})
    return recent
