from datetime import date, timedelta
from typing import List, Dict, Optional

from .supabase_client import (
    get_events_sync,
    get_today_events_sync,
    get_upcoming_events_sync,
    add_event_sync,
    get_health_records_sync,
    add_health_record_sync,
)


def add_event(title: str, when: str, note: str = "") -> Dict:
    try:
        result = add_event_sync(title, when, note)
        return {"id": result.get("id"), "title": title, "date": when, "note": note}
    except Exception:
        return {"title": title, "date": when, "note": note}


def get_today_events() -> List[Dict]:
    try:
        return get_today_events_sync(date.today().isoformat())
    except Exception:
        return []


def get_upcoming_events(days: int = 7) -> List[Dict]:
    try:
        return get_upcoming_events_sync(date.today().isoformat(), days)
    except Exception:
        return []


def add_health_record(record_type: str, value: str, note: str = "") -> Dict:
    try:
        return add_health_record_sync(record_type, value, note)
    except Exception:
        return {"type": record_type, "value": value}


def get_latest_health(record_type: Optional[str] = None) -> List[Dict]:
    try:
        records = get_health_records_sync(limit=10)
        if record_type:
            records = [r for r in records if r.get("record_type") == record_type]
        return records
    except Exception:
        return []


def calendar_context() -> str:
    today_events = get_today_events()
    upcoming = get_upcoming_events(3)

    parts = []
    if today_events:
        parts.append("今天日程：" + "；".join(f"{e['title']}" for e in today_events))
    if upcoming:
        parts.append("近期待办：" + "；".join(f"{e['date'][5:]}-{e['title']}" for e in upcoming[:3]))

    return " | ".join(parts) if parts else ""


def health_context() -> str:
    latest = get_latest_health()
    if not latest:
        return ""
    lines = []
    for r in latest[-3:]:
        lines.append(f"{r['record_type']}: {r['value']}")
    return " | ".join(lines) if lines else ""
