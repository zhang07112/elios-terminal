import os
import httpx

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

_headers = {
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
}


# ------------------- Conversations -------------------
def save_conversation_sync(role: str, content: str, metadata: dict = None) -> dict:
    url = f"{SUPABASE_URL}/rest/v1/conversations"
    data = {"role": role, "content": content, "metadata": metadata or {}}
    response = httpx.post(url, headers=_headers, json=data)
    response.raise_for_status()
    return response.json()


def get_conversations_sync(limit: int = 100, ascending: bool = False) -> list:
    url = f"{SUPABASE_URL}/rest/v1/conversations"
    order = "created_at.asc" if ascending else "created_at.desc"
    params = {"limit": limit, "order": order}
    response = httpx.get(url, headers=_headers, params=params)
    response.raise_for_status()
    return response.json()


# ------------------- Elios Profile (Cici profile) -------------------
def get_elios_profile_sync() -> dict | None:
    url = f"{SUPABASE_URL}/rest/v1/elios_profiles"
    params = {"limit": 1}
    response = httpx.get(url, headers=_headers, params=params)
    if response.status_code == 200:
        result = response.json()
        return result[0] if result else None
    return None


def save_elios_profile_sync(data: dict) -> dict:
    url = f"{SUPABASE_URL}/rest/v1/elios_profiles"
    existing = get_elios_profile_sync()
    if existing:
        response = httpx.patch(
            f"{url}?id=eq.{existing['id']}", headers=_headers, json=data
        )
    else:
        response = httpx.post(url, headers=_headers, json=data)
    response.raise_for_status()
    return response.json()


# ------------------- Memory Cards -------------------
def get_memory_cards_sync(category: str = None, limit: int = 100) -> list:
    url = f"{SUPABASE_URL}/rest/v1/memory_cards"
    params = {"limit": limit, "order": "created_at.desc"}
    if category:
        params["category"] = category
    response = httpx.get(url, headers=_headers, params=params)
    response.raise_for_status()
    return response.json()


def save_memory_card_sync(title: str, content: str, tags: list = None) -> dict:
    url = f"{SUPABASE_URL}/rest/v1/memory_cards"
    data = {"title": title, "content": content, "tags": tags or []}
    response = httpx.post(url, headers=_headers, json=data)
    response.raise_for_status()
    return response.json()


def replace_all_memory_cards_sync(cards: list) -> None:
    url = f"{SUPABASE_URL}/rest/v1/memory_cards"
    httpx.delete(url, headers=_headers, params={"limit": 1000})
    for card in cards:
        httpx.post(
            url,
            headers=_headers,
            json={
                "title": card.get("topic", ""),
                "content": card.get("content", ""),
                "tags": card.get("keywords", []),
            },
        )


# ------------------- Diaries -------------------
def get_diary_sync(date_str: str) -> dict | None:
    url = f"{SUPABASE_URL}/rest/v1/diaries"
    params = {"date": f"eq.{date_str}", "limit": 1}
    response = httpx.get(url, headers=_headers, params=params)
    if response.status_code == 200:
        result = response.json()
        return result[0] if result else None
    return None


def save_diary_sync(date_str: str, content: str) -> dict:
    url = f"{SUPABASE_URL}/rest/v1/diaries"
    existing = get_diary_sync(date_str)
    data = {"date": date_str, "content": content}
    if existing:
        response = httpx.patch(
            f"{url}?date=eq.{date_str}", headers=_headers, json=data
        )
    else:
        response = httpx.post(url, headers=_headers, json=data)
    response.raise_for_status()
    return response.json()


# ------------------- Daily Summaries -------------------
def get_daily_summary_sync(date_str: str) -> str | None:
    url = f"{SUPABASE_URL}/rest/v1/daily_summaries"
    params = {"date": f"eq.{date_str}", "limit": 1}
    response = httpx.get(url, headers=_headers, params=params)
    if response.status_code == 200:
        result = response.json()
        return result[0].get("summary") if result else None
    return None


def save_daily_summary_sync(date_str: str, summary: str) -> dict:
    url = f"{SUPABASE_URL}/rest/v1/daily_summaries"
    existing = get_daily_summary_sync(date_str)
    data = {"date": date_str, "summary": summary}
    if existing:
        response = httpx.patch(
            f"{url}?date=eq.{date_str}", headers=_headers, json=data
        )
    else:
        response = httpx.post(url, headers=_headers, json=data)
    response.raise_for_status()
    return response.json()


# ------------------- Cost Logs -------------------
def save_cost_log_sync(model: str, prompt_tokens: int, completion_tokens: int) -> dict:
    url = f"{SUPABASE_URL}/rest/v1/cost_logs"
    data = {
        "model": model,
        "tokens_used": prompt_tokens + completion_tokens,
    }
    response = httpx.post(url, headers=_headers, json=data)
    response.raise_for_status()
    return response.json()


def get_cost_logs_sync(limit: int = 100) -> list:
    url = f"{SUPABASE_URL}/rest/v1/cost_logs"
    params = {"limit": limit, "order": "created_at.desc"}
    response = httpx.get(url, headers=_headers, params=params)
    response.raise_for_status()
    return response.json()


# ------------------- Events (schedule) -------------------
def get_events_sync() -> list:
    url = f"{SUPABASE_URL}/rest/v1/events"
    params = {"order": "date"}
    response = httpx.get(url, headers=_headers, params=params)
    response.raise_for_status()
    return response.json()


def get_today_events_sync(today_date: str) -> list:
    url = f"{SUPABASE_URL}/rest/v1/events"
    params = {"date": f"eq.{today_date}"}
    response = httpx.get(url, headers=_headers, params=params)
    response.raise_for_status()
    return response.json()


def get_upcoming_events_sync(start_date: str, days: int = 7) -> list:
    url = f"{SUPABASE_URL}/rest/v1/events"
    params = {"date": f"gte.{start_date}", "limit": days, "order": "date"}
    response = httpx.get(url, headers=_headers, params=params)
    response.raise_for_status()
    return response.json()


def add_event_sync(title: str, date_str: str, note: str = "") -> dict:
    url = f"{SUPABASE_URL}/rest/v1/events"
    data = {"title": title, "date": date_str, "note": note}
    response = httpx.post(url, headers=_headers, json=data)
    response.raise_for_status()
    return response.json()


# ------------------- Health Records -------------------
def get_health_records_sync(limit: int = 10) -> list:
    url = f"{SUPABASE_URL}/rest/v1/health_records"
    params = {"limit": limit, "order": "created_at.desc"}
    response = httpx.get(url, headers=_headers, params=params)
    response.raise_for_status()
    return response.json()


def add_health_record_sync(record_type: str, value: str, note: str = "") -> dict:
    url = f"{SUPABASE_URL}/rest/v1/health_records"
    data = {"record_type": record_type, "value": value, "note": note}
    response = httpx.post(url, headers=_headers, json=data)
    response.raise_for_status()
    return response.json()


# ------------------- Profile (user) -------------------
def get_profile_sync() -> dict | None:
    url = f"{SUPABASE_URL}/rest/v1/profiles"
    params = {"limit": 1}
    response = httpx.get(url, headers=_headers, params=params)
    response.raise_for_status()
    result = response.json()
    return result[0] if result else None
