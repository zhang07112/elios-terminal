import os
import httpx

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

_headers = {
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
}


# ------------------- Table Schemas (create manually in Supabase) -------------------
# diaries: id (uuid, pk), date (date), content (text), author (text), created_at (timestamptz)
# moods: id (uuid, pk), mood (text), note (text), created_at (timestamptz)
# study_sessions: id (uuid, pk), topic (text), duration_minutes (int4), note (text), created_at (timestamptz)
# music: id (uuid, pk), title (text), artist (text), url (text), created_at (timestamptz)
# photos: id (uuid, pk), url (text), caption (text), created_at (timestamptz)
# goodnight: id (uuid, pk), content (text), mood_before (text), created_at (timestamptz)


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


def save_diary_sync(date_str: str, content: str, author: str = "user") -> dict:
    url = f"{SUPABASE_URL}/rest/v1/diaries"
    existing = get_diary_sync(date_str)
    data = {"date": date_str, "content": content, "author": author}
    if existing:
        response = httpx.patch(
            f"{url}?date=eq.{date_str}", headers=_headers, json=data
        )
    else:
        response = httpx.post(url, headers=_headers, json=data)
    response.raise_for_status()
    return response.json()


def get_diaries_sync() -> list:
    url = f"{SUPABASE_URL}/rest/v1/diaries"
    params = {"order": "date.desc"}
    response = httpx.get(url, headers=_headers, params=params)
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


# ------------------- Moods -------------------
def get_moods_sync(limit: int = 30) -> list:
    url = f"{SUPABASE_URL}/rest/v1/moods"
    params = {"limit": limit, "order": "created_at.desc"}
    response = httpx.get(url, headers=_headers, params=params)
    response.raise_for_status()
    return response.json()


def save_mood_sync(mood: str, note: str = "") -> dict:
    url = f"{SUPABASE_URL}/rest/v1/moods"
    data = {"mood": mood, "note": note}
    response = httpx.post(url, headers=_headers, json=data)
    response.raise_for_status()
    return response.json()


# ------------------- Study Sessions -------------------
def get_study_sessions_sync(limit: int = 20) -> list:
    url = f"{SUPABASE_URL}/rest/v1/study_sessions"
    params = {"limit": limit, "order": "created_at.desc"}
    response = httpx.get(url, headers=_headers, params=params)
    response.raise_for_status()
    return response.json()


def save_study_session_sync(topic: str, duration_minutes: int, note: str = "") -> dict:
    url = f"{SUPABASE_URL}/rest/v1/study_sessions"
    data = {"topic": topic, "duration_minutes": duration_minutes, "note": note}
    response = httpx.post(url, headers=_headers, json=data)
    response.raise_for_status()
    return response.json()


# ------------------- Music -------------------
def get_music_sync() -> list:
    url = f"{SUPABASE_URL}/rest/v1/music"
    params = {"order": "created_at.desc"}
    response = httpx.get(url, headers=_headers, params=params)
    response.raise_for_status()
    return response.json()


def save_music_sync(title: str, artist: str, url: str = "") -> dict:
    url_addr = f"{SUPABASE_URL}/rest/v1/music"
    data = {"title": title, "artist": artist, "url": url}
    response = httpx.post(url_addr, headers=_headers, json=data)
    response.raise_for_status()
    return response.json()


# ------------------- Photos -------------------
def get_photos_sync() -> list:
    url = f"{SUPABASE_URL}/rest/v1/photos"
    params = {"order": "created_at.desc"}
    response = httpx.get(url, headers=_headers, params=params)
    response.raise_for_status()
    return response.json()


def save_photo_sync(url: str, caption: str = "") -> dict:
    url_addr = f"{SUPABASE_URL}/rest/v1/photos"
    data = {"url": url, "caption": caption}
    response = httpx.post(url_addr, headers=_headers, json=data)
    response.raise_for_status()
    return response.json()


# ------------------- Goodnight -------------------
def get_goodnight_sync() -> list:
    url = f"{SUPABASE_URL}/rest/v1/goodnight"
    params = {"order": "created_at.desc"}
    response = httpx.get(url, headers=_headers, params=params)
    response.raise_for_status()
    return response.json()


def save_goodnight_sync(content: str, mood_before: str = "") -> dict:
    url = f"{SUPABASE_URL}/rest/v1/goodnight"
    data = {"content": content, "mood_before": mood_before}
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
