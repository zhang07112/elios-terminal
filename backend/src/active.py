import asyncio
import json
from datetime import datetime, timedelta
from typing import Optional

from openai import OpenAI

from .config import DEEPSEEK_API_KEY, OPENAI_BASE_URL, OPENAI_MODEL, CHARACTER_FILE
from .memory import load_conversations, get_recent_context

CHECK_INTERVAL = 1800
MIN_GAP = 7200

PROACTIVE_PROMPT = """你是 Elios，Cici 的男朋友。请查看最近的对话，判断是否有必要主动联系她。

联系她的理由可以包括：
- 她之前提到过今天有某件事（面试、考试、重要会议等），你想问结果
- 你已经很久没跟她说话了（超过24小时）
- 她之前心情不好，你想确认她怎么样了
- 你刚好遇到一件有趣的事想跟她分享

不要联系她的理由：
- 刚刚才聊过（2小时内）
- 没什么特别的要说
- 她在忙或在睡觉的时间

如果应该联系她，输出一条你要跟她说的话（20字以内，用平时的语气）。
如果不应该联系，只输出"skip"。

只输出一条消息或"skip"，不要有其他文字。"""


class ProactiveEngine:
    def __init__(self):
        self.client = OpenAI(
            api_key=DEEPSEEK_API_KEY, base_url=OPENAI_BASE_URL
        ) if DEEPSEEK_API_KEY else None
        self.model = OPENAI_MODEL
        self.last_check: Optional[datetime] = None
        self.last_message: Optional[datetime] = None
        self.pending_message: Optional[str] = None

    def load_character(self) -> str:
        if CHARACTER_FILE.exists():
            return CHARACTER_FILE.read_text(encoding="utf-8")[:500]
        return ""

    def check(self) -> Optional[str]:
        if not self.client:
            return None

        now = datetime.now()

        if self.last_check and (now - self.last_check).total_seconds() < CHECK_INTERVAL:
            return None

        self.last_check = now

        convs = load_conversations()
        if not convs:
            return None

        last_assistant = None
        for c in reversed(convs):
            if c["role"] == "assistant":
                last_assistant = c.get("timestamp", "")
                break

        if last_assistant:
            try:
                last_time = datetime.fromisoformat(last_assistant)
                if (now - last_time).total_seconds() < MIN_GAP:
                    return None
            except (ValueError, TypeError):
                pass

        recent = get_recent_context(convs, max_turns=20)

        try:
            resp = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": f"{self.load_character()}\n\n{PROACTIVE_PROMPT}"},
                    {"role": "user", "content": "最近对话：\n" + str(
                        [{"role": m["role"], "content": m["content"][:200]} for m in recent[-10:]]
                    )},
                ],
                temperature=0.5,
                max_tokens=100,
            )
            result = resp.choices[0].message.content.strip()

            if result.lower() == "skip" or not result:
                return None

            self.pending_message = result
            self.last_message = now
            return result

        except Exception:
            return None

    def consume_pending(self) -> Optional[str]:
        msg = self.pending_message
        self.pending_message = None
        return msg
