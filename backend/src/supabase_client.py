import os
import httpx
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

_headers = {
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}


async def _request(method, path, data=None, params=None):
    url = f"{SUPABASE_URL}/rest/v1{path}"
    async with httpx.AsyncClient() as client:
        response = await client.request(method, url, headers=_headers, json=data, params=params)
        response.raise_for_status()
        return response.json()


# ------------------- Conversations -------------------
async def save_conversation(role: str, content: str, metadata: dict = None) -> dict:
    data = {
        "role": role,
        "content": content,
        "metadata": metadata or {}
    }
    return await _request("POST", "/conversations", data)


async def get_conversations(limit: int = 100) -> list:
    params = {"limit": limit, "order": "created_at.desc"}
    return await _request("GET", "/conversations", params=params)


# ------------------- Memory Cards -------------------
async def save_memory_card(title: str, content: str, category: str = "", tags: list = None, importance: int = 1) -> dict:
    data = {
        "title": title,
        "content": content,
        "category": category,
        "tags": tags or [],
        "importance": importance
    }
    return await _request("POST", "/memory_cards", data)


async def get_memory_cards(category: str = None, limit: int = 100) -> list:
    params = {"limit": limit, "order": "created_at.desc"}
    if category:
        params["category"] = category
    return await _request("GET", "/memory_cards", params=params)


async def update_memory_card(card_id: str, **kwargs) -> dict | None:
    return await _request("PATCH", f"/memory_cards?id=eq.{card_id}", kwargs)


# ------------------- Events -------------------
async def save_event(title: str, date: str, time: str = "", note: str = "") -> dict:
    data = {
        "title": title,
        "date": date,
        "time": time,
        "note": note
    }
    return await _request("POST", "/events", data)


async def get_events() -> list:
    return await _request("GET", "/events", params={"order": "date"})


async def get_today_events(today_date: str) -> list:
    return await _request("GET", "/events", params={"date": f"eq.{today_date}"})


async def get_upcoming_events(start_date: str, days: int = 7) -> list:
    params = {"date": f"gte.{start_date}", "limit": days, "order": "date"}
    return await _request("GET", "/events", params=params)


# ------------------- Health Records -------------------
async def save_health_record(record_type: str, value: str, note: str = "", metadata: dict = None) -> dict:
    data = {
        "record_type": record_type,
        "value": value,
        "note": note,
        "metadata": metadata or {}
    }
    return await _request("POST", "/health_records", data)


async def get_health_records(limit: int = 50) -> list:
    params = {"limit": limit, "order": "created_at.desc"}
    return await _request("GET", "/health_records", params=params)


# ------------------- Cost Logs -------------------
async def save_cost_log(model: str, tokens_used: int, cost: float, metadata: dict = None) -> dict:
    data = {
        "model": model,
        "tokens_used": tokens_used,
        "cost": cost,
        "metadata": metadata or {}
    }
    return await _request("POST", "/cost_logs", data)


async def get_cost_logs(limit: int = 100) -> list:
    params = {"limit": limit, "order": "created_at.desc"}
    return await _request("GET", "/cost_logs", params=params)


# ------------------- Profiles -------------------
async def get_profile() -> dict | None:
    result = await _request("GET", "/profiles", params={"limit": 1})
    return result[0] if result else None


async def update_profile(display_name: str = None, avatar_url: str = None, bio: str = None) -> dict | None:
    data = {}
    if display_name is not None:
        data["display_name"] = display_name
    if avatar_url is not None:
        data["avatar_url"] = avatar_url
    if bio is not None:
        data["bio"] = bio
    if not data:
        return None
    
    profile = await get_profile()
    if profile:
        return await _request("PATCH", f"/profiles?id=eq.{profile['id']}", data)
    else:
        return await _request("POST", "/profiles", data)


# ------------------- Daily Summaries -------------------
async def save_daily_summary(date: str, summary: str) -> dict:
    data = {"date": date, "summary": summary}
    existing = await _request("GET", "/daily_summaries", params={"date": f"eq.{date}"})
    if existing:
        return await _request("PATCH", f"/daily_summaries?date=eq.{date}", data)
    else:
        return await _request("POST", "/daily_summaries", data)


async def get_daily_summary(date: str) -> dict | None:
    result = await _request("GET", "/daily_summaries", params={"date": f"eq.{date}"})
    return result[0] if result else None


# 同步版本（用于非异步上下文）
def save_conversation_sync(role: str, content: str, metadata: dict = None) -> dict:
    import httpx
    url = f"{SUPABASE_URL}/rest/v1/conversations"
    data = {
        "role": role,
        "content": content,
        "metadata": metadata or {}
    }
    response = httpx.post(url, headers=_headers, json=data)
    response.raise_for_status()
    return response.json()


def get_conversations_sync(limit: int = 100) -> list:
    import httpx
    url = f"{SUPABASE_URL}/rest/v1/conversations"
    params = {"limit": limit, "order": "created_at.desc"}
    response = httpx.get(url, headers=_headers, params=params)
    response.raise_for_status()
    return response.json()


def get_profile_sync() -> dict | None:
    import httpx
    url = f"{SUPABASE_URL}/rest/v1/profiles"
    params = {"limit": 1}
    response = httpx.get(url, headers=_headers, params=params)
    response.raise_for_status()
    result = response.json()
    return result[0] if result else None
