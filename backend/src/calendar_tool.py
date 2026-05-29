import json
from datetime import datetime, date, timedelta
from typing import List, Dict, Optional
from pathlib import Path

from .config import DATA_DIR

CALENDAR_FILE = DATA_DIR / "schedule.json"
EVENTS_FILE = DATA_DIR / "events.json"


def ensure():
    DATA_DIR.mkdir(parents=True, exist_ok=True)


def load_schedule() -> Dict:
    ensure()
    if CALENDAR_FILE.exists():
        try:
            return json.loads(CALENDAR_FILE.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, Exception):
            pass
    return {"events": []}


def save_schedule(data: Dict):
    CALENDAR_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def load_health() -> Dict:
    ensure()
    if EVENTS_FILE.exists():
        try:
            return json.loads(EVENTS_FILE.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, Exception):
            pass
    return {"records": []}


def save_health(data: Dict):
    EVENTS_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def add_event(title: str, when: str, note: str = "") -> Dict:
    schedule = load_schedule()
    event = {
        "id": len(schedule["events"]) + 1,
        "title": title,
        "date": when,
        "note": note,
        "created": datetime.now().isoformat(),
    }
    schedule["events"].append(event)
    save_schedule(schedule)
    return event


def get_today_events() -> List[Dict]:
    today = date.today().isoformat()
    schedule = load_schedule()
    return [e for e in schedule["events"] if e.get("date") == today]


def get_upcoming_events(days: int = 7) -> List[Dict]:
    today = date.today()
    end = today + timedelta(days=days)
    schedule = load_schedule()
    result = []
    for e in schedule["events"]:
        try:
            d = date.fromisoformat(e["date"])
            if today <= d <= end:
                result.append(e)
        except (ValueError, TypeError):
            pass
    return sorted(result, key=lambda x: x.get("date", ""))


def add_health_record(record_type: str, value: str, note: str = "") -> Dict:
    health = load_health()
    record = {
        "id": len(health["records"]) + 1,
        "type": record_type,
        "value": value,
        "note": note,
        "timestamp": datetime.now().isoformat(),
    }
    health["records"].append(record)
    save_health(health)
    return record


def get_latest_health(record_type: Optional[str] = None) -> List[Dict]:
    health = load_health()
    records = health["records"]
    if record_type:
        records = [r for r in records if r.get("type") == record_type]
    return records[-10:]


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
        lines.append(f"{r['type']}: {r['value']}")
    return " | ".join(lines) if lines else ""
