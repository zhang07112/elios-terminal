import json
import urllib.request
import urllib.parse
from datetime import datetime
from typing import Optional

from .calendar_tool import calendar_context, health_context

WEATHER_CACHE = {}
SEARCH_CACHE = {}


def get_weather(city: str = "成都") -> Optional[str]:
    cache_key = f"{city}_{datetime.now().strftime('%Y%m%d%H')}"
    if cache_key in WEATHER_CACHE:
        return WEATHER_CACHE[cache_key]

    try:
        url = f"https://wttr.in/{urllib.parse.quote(city)}?format=%C+%t+%h+%w&lang=zh"
        req = urllib.request.Request(url, headers={"User-Agent": "curl/8.0"})
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = resp.read().decode("utf-8").strip()
            WEATHER_CACHE[cache_key] = data
            return data
    except Exception:
        return None


def web_search(query: str) -> Optional[str]:
    cache_key = query.lower().strip()
    if cache_key in SEARCH_CACHE:
        return SEARCH_CACHE[cache_key]

    try:
        url = f"https://api.duckduckgo.com/?q={urllib.parse.quote(query)}&format=json&no_html=1"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            abstract = data.get("AbstractText", "")
            if abstract:
                SEARCH_CACHE[cache_key] = abstract
                return abstract
        return None
    except Exception:
        return None


def check_message_for_tools(message: str) -> dict:
    result = {"weather": None, "search": None, "calendar": "", "health": ""}

    weather_keywords = ["天气", "下雨", "降温", "多少度", "热不热", "冷不冷", "台风", "雪"]
    if any(kw in message for kw in weather_keywords):
        result["weather"] = get_weather()

    search_keywords = ["搜一下", "查一下", "百度一下", "是什么", "什么是", "最近", "新闻"]
    if any(kw in message for kw in search_keywords):
        result["search"] = web_search(message[:100])

    calendar_keywords = ["日程", "今天有什么", "安排", "待办", "几点", "什么时候", "健康", "睡眠", "心率"]
    if any(kw in message for kw in calendar_keywords):
        result["calendar"] = calendar_context()
        result["health"] = health_context()

    return result


def tools_to_context(tool_results: dict) -> str:
    parts = []
    if tool_results.get("weather"):
        parts.append(f"【实时天气】{tool_results['weather']}")
    if tool_results.get("search"):
        parts.append(f"【搜索结果】{tool_results['search']}")
    if tool_results.get("calendar"):
        parts.append(f"【日程信息】{tool_results['calendar']}")
    if tool_results.get("health"):
        parts.append(f"【健康记录】{tool_results['health']}")
    return "\n".join(parts)
