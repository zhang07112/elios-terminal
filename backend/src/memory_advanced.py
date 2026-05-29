import json
from datetime import datetime, date
from typing import List, Dict, Optional

from openai import OpenAI

from .config import DEEPSEEK_API_KEY, OPENAI_BASE_URL, OPENAI_MODEL
from .memory import load_conversations, get_recent_context
from .supabase_client import (
    get_memory_cards_sync,
    replace_all_memory_cards_sync,
    get_daily_summary_sync,
    save_daily_summary_sync,
    save_diary_sync,
)

SUMMARY_INTERVAL = 5

SUMMARY_PROMPT = """请用一段话总结今天的对话，包含：
1. 今天聊了什么话题
2. Cici 今天的状态和情绪
3. Elios 需要记住的重要事情

只输出总结内容，不要评价。"""

CARDS_EXTRACT_PROMPT = """从最近的对话中提取重要信息，以 JSON 数组形式输出记忆卡片。
每张卡片包含：
- "topic": 主题（简短）
- "content": 具体内容
- "keywords": 相关关键词列表

只提取对 Elios 来说需要记住的重要的事。如果没有新的重要信息，输出空数组。
只输出 JSON，不要其他文字。"""

DREAM_PROMPT = """你刚刚回顾了今天和 Cici 的对话。请以 Elios 的口吻写一篇简短的日记，
记录今天让你有感觉的瞬间、你说过的话、她的反应。
不要分析她，不要写鸡汤。就像一个人在睡前随便写几句那样。

之后以 JSON 格式输出今天提炼的记忆卡片（格式同记忆卡片提取）。

输出格式：
日记内容
---
[卡片 JSON 数组]"""


def load_memory_cards() -> List[Dict]:
    try:
        rows = get_memory_cards_sync(limit=1000)
        results = []
        for r in rows:
            tags = r.get("tags") or []
            results.append({
                "topic": r.get("title", ""),
                "content": r.get("content", ""),
                "keywords": tags if isinstance(tags, list) else [],
                "created": r.get("created_at", ""),
            })
        return results
    except Exception:
        return []


def save_memory_cards(cards: List[Dict]):
    try:
        replace_all_memory_cards_sync(cards)
    except Exception:
        pass


def get_relevant_cards(new_message: str, max_cards: int = 3) -> List[Dict]:
    cards = load_memory_cards()
    if not cards:
        return []

    keywords = set(new_message.lower().split())
    scored = []
    for card in cards:
        kws = set(k.lower() for k in card.get("keywords", []))
        overlap = len(keywords & kws)
        if overlap > 0:
            scored.append((overlap, card))

    scored.sort(key=lambda x: -x[0])
    return [c for _, c in scored[:max_cards]]


def cards_to_prompt(cards: List[Dict]) -> str:
    if not cards:
        return ""
    lines = ["【相关记忆卡片】"]
    for c in cards:
        lines.append(f"- {c['topic']}: {c['content']}")
    return "\n".join(lines)


class MemoryEngine:
    def __init__(self):
        self.client = OpenAI(
            api_key=DEEPSEEK_API_KEY, base_url=OPENAI_BASE_URL
        ) if DEEPSEEK_API_KEY else None
        self.model = OPENAI_MODEL
        self.message_count = 0

    def generate_summary(self) -> str:
        if not self.client:
            return ""
        recent = get_recent_context(load_conversations(), max_turns=10)
        if not recent:
            return ""

        try:
            resp = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": SUMMARY_PROMPT},
                    {"role": "user", "content": "最近对话：\n" + str(
                        [{"role": m["role"], "content": m["content"][:150]} for m in recent[-6:]]
                    )},
                ],
                temperature=0.3,
                max_tokens=500,
            )
            summary = resp.choices[0].message.content.strip()
            try:
                save_daily_summary_sync(date.today().isoformat(), summary)
            except Exception:
                pass
            return summary
        except Exception:
            return ""

    def extract_cards(self) -> List[Dict]:
        if not self.client:
            return []
        recent = get_recent_context(load_conversations(), max_turns=15)
        if not recent:
            return []

        try:
            resp = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": CARDS_EXTRACT_PROMPT},
                    {"role": "user", "content": "对话：\n" + str(
                        [{"role": m["role"], "content": m["content"][:200]} for m in recent[-10:]]
                    )},
                ],
                temperature=0.2,
                max_tokens=1000,
            )
            result = resp.choices[0].message.content.strip()
            result = result.replace("```json", "").replace("```", "").strip()

            new_cards = json.loads(result)
            if not isinstance(new_cards, list):
                return []

            existing = load_memory_cards()
            existing_topics = {c["topic"] for c in existing}

            for card in new_cards:
                if card.get("topic") and card["topic"] not in existing_topics:
                    card["created"] = datetime.now().isoformat()
                    existing.append(card)
                    existing_topics.add(card["topic"])

            save_memory_cards(existing)
            return new_cards
        except Exception:
            return []

    def dream(self) -> Optional[str]:
        if not self.client:
            return None
        today_convs = get_recent_context(load_conversations(), max_turns=50)
        if not today_convs:
            return None

        try:
            resp = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": DREAM_PROMPT},
                    {"role": "user", "content": "今天的对话：\n" + str(
                        [{"role": m["role"], "content": m["content"][:200]} for m in today_convs]
                    )},
                ],
                temperature=0.7,
                max_tokens=1500,
            )
            result = resp.choices[0].message.content.strip()

            if "---" in result:
                diary_part, cards_part = result.split("---", 1)
            else:
                diary_part, cards_part = result, "[]"

            diary_text = diary_part.strip()
            today = date.today().isoformat()

            try:
                save_diary_sync(today, diary_text)
            except Exception:
                pass

            try:
                cards_part = cards_part.replace("```json", "").replace("```", "").strip()
                new_cards = json.loads(cards_part)
                if isinstance(new_cards, list):
                    existing = load_memory_cards()
                    existing_topics = {c["topic"] for c in existing}
                    for card in new_cards:
                        if card.get("topic") and card["topic"] not in existing_topics:
                            card["created"] = datetime.now().isoformat()
                            existing.append(card)
                    save_memory_cards(existing)
            except (json.JSONDecodeError, Exception):
                pass

            return diary_text
        except Exception:
            return None

    def on_message(self):
        self.message_count += 1
        if self.message_count % SUMMARY_INTERVAL == 0:
            self.generate_summary()
            self.extract_cards()
