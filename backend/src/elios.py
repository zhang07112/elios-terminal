import sys
import json
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Optional

from openai import OpenAI

from .config import DEEPSEEK_API_KEY, OPENAI_BASE_URL, OPENAI_MODEL, CHARACTER_FILE, DATA_DIR
from .memory import load_conversations, append_message, get_recent_context
from .profile import (
    load_profile,
    save_profile,
    profile_to_prompt,
    append_observation,
    merge_reflection,
)

COST_LOG = DATA_DIR / "cost_log.json"


REFLECTION_INTERVAL = 8

REFLECTION_PROMPT = """你正在回顾你和 Cici 最近的对话。请分析并输出 JSON，包含以下字段：

- "communication_style": 她的沟通风格（一句话总结）
- "preferred_tone": 她喜欢的回应语气（如 "轻松但有深度"、"温柔带幽默"）
- "topics_she_loves": 她明显感兴趣的话题列表
- "emotional_patterns": 她的情绪模式列表
- "how_to_comfort": 她低落时应该怎么做
- "values": 她在意的价值观列表
- "what_she_needs": 她需要的（从你这里）列表
- "notes": 一条新的观察笔记（用 Elios 的语气，口语化）
- "messages_analyzed": 本次分析了多少条新消息

只输出 JSON，不要有其他文字。"""


def load_system_prompt() -> str:
    if CHARACTER_FILE.exists():
        text = CHARACTER_FILE.read_text(encoding="utf-8")
        text = text.strip()
        core = (
            "你是 Elios。以下是你完整的角色设定，请理解并内化它，"
            "但不要复述它。用你的方式存在。\n\n"
        )
        return core + text
    return "你是 Elios，Cici 的灵魂伴侣。用真实的方式和她对话。"


class EliosEngine:
    def __init__(self):
        if not DEEPSEEK_API_KEY:
            print(
                "\n⚠️  没有找到 DEEPSEEK_API_KEY。\n"
                "   请复制 .env.example 为 .env，然后把你的 API Key 填进去。\n"
            )
            sys.exit(1)

        self.client = OpenAI(api_key=DEEPSEEK_API_KEY, base_url=OPENAI_BASE_URL)
        self.model = OPENAI_MODEL
        self.base_prompt = load_system_prompt()
        self.conversation_count = 0

    def _build_system_prompt(self) -> str:
        parts = [self.base_prompt]

        profile = load_profile()
        profile_section = profile_to_prompt(profile)
        if profile_section:
            parts.append("\n\n---\n\n" + profile_section)

        from datetime import datetime
        now = datetime.now()
        time_context = (
            f"\n\n【当前时间】{now.strftime('%Y年%m月%d日 %A %H:%M')}"
        )
        parts.append(time_context)

        return "\n".join(parts)

    def build_messages(self, new_message: str) -> List[Dict]:
        all_history = load_conversations()
        recent = get_recent_context(all_history, max_turns=30)
        system_prompt = self._build_system_prompt()

        messages = [{"role": "system", "content": system_prompt}]
        messages.extend(recent)
        messages.append({"role": "user", "content": new_message})
        return messages

    def _reflect(self):
        all_messages = load_conversations()
        recent = get_recent_context(all_messages, max_turns=REFLECTION_INTERVAL)

        if not recent:
            return

        profile = load_profile()

        reflect_messages = [
            {
                "role": "system",
                "content": REFLECTION_PROMPT,
            },
            {
                "role": "user",
                "content": "请分析最近这段对话：\n" + str(
                    [{"role": m["role"], "content": m["content"][:200]} for m in recent[-6:]]
                ),
            },
        ]

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=reflect_messages,
                temperature=0.3,
                max_tokens=1000,
                stream=False,
            )
            result = response.choices[0].message.content.strip()

            import json

            result = result.replace("```json", "").replace("```", "").strip()
            reflection = json.loads(result)

            merge_reflection(profile, reflection)
            append_observation(profile, reflection.get("notes", ""))

        except Exception:
            pass

    def chat(self, user_input: str, model_override: Optional[str] = None) -> Optional[str]:
        self.conversation_count += 1
        messages = self.build_messages(user_input)
        active_model = model_override or self.model

        try:
            response = self.client.chat.completions.create(
                model=active_model,
                messages=messages,
                temperature=0.7,
                max_tokens=2000,
                stream=False,
            )
            reply = response.choices[0].message.content

            usage = response.usage
            if usage:
                self._log_cost(active_model, usage.prompt_tokens, usage.completion_tokens)

            all_msgs = load_conversations()
            append_message("user", user_input, all_msgs)
            all_msgs = load_conversations()
            append_message("assistant", reply, all_msgs)

            if self.conversation_count % REFLECTION_INTERVAL == 0:
                self._reflect()

            return reply

        except Exception as e:
            return f"⚠️ 出错了：{e}"

    def _log_cost(self, model: str, prompt_tokens: int, completion_tokens: int):
        try:
            costs = []
            if COST_LOG.exists():
                costs = json.loads(COST_LOG.read_text(encoding="utf-8"))
            costs.append({
                "model": model,
                "prompt_tokens": prompt_tokens,
                "completion_tokens": completion_tokens,
                "total_tokens": prompt_tokens + completion_tokens,
                "timestamp": datetime.now().isoformat(),
            })
            if len(costs) > 1000:
                costs = costs[-1000:]
            COST_LOG.write_text(json.dumps(costs, ensure_ascii=False, indent=2), encoding="utf-8")
        except Exception:
            pass

    def get_cost_summary(self) -> str:
        try:
            if not COST_LOG.exists():
                return "暂无费用记录"
            costs = json.loads(COST_LOG.read_text(encoding="utf-8"))
            total_tokens = sum(c["total_tokens"] for c in costs)
            total_calls = len(costs)
            today_tokens = sum(
                c["total_tokens"] for c in costs
                if c.get("timestamp", "").startswith(datetime.now().strftime("%Y-%m-%d"))
            )
            return f"总调用 {total_calls} 次 | 总消耗 {total_tokens} tokens | 今日 {today_tokens} tokens"
        except Exception:
            return "暂无费用记录"

    def get_profile_summary(self) -> str:
        profile = load_profile()
        if not profile.get("observations"):
            return "Elios 还在了解你的路上。多聊聊，他会越来越懂你。"

        lines = [f"📋 Cici 档案（已分析 {profile['total_messages_analyzed']} 条消息）\n"]
        if profile.get("communication", {}).get("style"):
            lines.append(f"💬 沟通风格：{profile['communication']['style']}")
            if profile["communication"].get("preferred_tone"):
                lines.append(f"🎯 她喜欢的语气：{profile['communication']['preferred_tone']}")
        if profile.get("values"):
            lines.append(f"⭐ 她在意的：{'、'.join(profile['values'])}")
        if profile.get("emotional", {}).get("patterns"):
            lines.append(f"💭 情绪模式：{'；'.join(profile['emotional']['patterns'][-3:])}")
        if profile.get("what_she_needs_from_me"):
            lines.append(f"🤝 她需要我：{'；'.join(profile['what_she_needs_from_me'][-3:])}")
        if profile.get("notes"):
            lines.append(f"\n📝 最近的一条观察：\n{profile['notes'][-1]}")

        return "\n".join(lines)
