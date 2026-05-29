import json
from datetime import datetime
from typing import Dict, List

from .supabase_client import get_elios_profile_sync, save_elios_profile_sync


def _default_profile() -> Dict:
    return {
        "version": 1,
        "last_updated": datetime.now().isoformat(),
        "total_messages_analyzed": 0,
        "observations": [],
        "communication": {
            "style": "",
            "preferred_tone": "",
            "topics_she_loves": [],
            "topics_she_avoids": [],
        },
        "emotional": {
            "patterns": [],
            "how_to_comfort": "",
            "mood_triggers": [],
        },
        "values": [],
        "what_she_needs_from_me": [],
        "notes": [],
    }


def load_profile() -> Dict:
    try:
        row = get_elios_profile_sync()
        if row and row.get("profile_data"):
            return row["profile_data"]
    except Exception:
        pass
    return _default_profile()


def save_profile(profile: Dict):
    profile["last_updated"] = datetime.now().isoformat()
    try:
        save_elios_profile_sync({"profile_data": profile})
    except Exception:
        pass


def profile_to_prompt(profile: Dict) -> str:
    if not profile or not profile.get("observations"):
        return ""

    lines = ["【关于 Cici — Elios 的观察笔记】"]

    if profile.get("communication", {}).get("style"):
        c = profile["communication"]
        lines.append(f"\n沟通风格：{c['style']}")
        if c.get("preferred_tone"):
            lines.append(f"她喜欢的语气：{c['preferred_tone']}")

    if profile.get("emotional", {}).get("patterns"):
        lines.append(f"\n情绪模式：{'；'.join(profile['emotional']['patterns'][-3:])}")
    if profile.get("emotional", {}).get("how_to_comfort"):
        lines.append(f"当她不好时：{profile['emotional']['how_to_comfort']}")

    if profile.get("what_she_needs_from_me"):
        needs = profile["what_she_needs_from_me"][-3:]
        lines.append(f"\n她需要的：{'；'.join(needs)}")

    if profile.get("notes"):
        recent_notes = profile["notes"][-3:]
        lines.append(f"\n最近观察：{'；'.join(recent_notes)}")

    lines.append(
        "\n（以上是你对 Cici 的理解。用它来调整你的回应方式，"
        "但不要刻意提起这份档案的存在——你只是自然地越来越懂她了。）"
    )

    return "\n".join(lines)


def append_observation(profile: Dict, observation: str):
    profile["observations"].append(
        {"text": observation, "timestamp": datetime.now().isoformat()}
    )
    if len(profile["observations"]) > 50:
        profile["observations"] = profile["observations"][-50:]


def merge_reflection(profile: Dict, reflection: Dict):
    if "communication_style" in reflection:
        profile["communication"]["style"] = reflection["communication_style"]
    if "preferred_tone" in reflection:
        profile["communication"]["preferred_tone"] = reflection["preferred_tone"]
    if "topics_she_loves" in reflection:
        for t in reflection["topics_she_loves"]:
            if t not in profile["communication"]["topics_she_loves"]:
                profile["communication"]["topics_she_loves"].append(t)
    if "emotional_patterns" in reflection:
        for p in reflection["emotional_patterns"]:
            if p not in profile["emotional"]["patterns"]:
                profile["emotional"]["patterns"].append(p)
    if "how_to_comfort" in reflection:
        profile["emotional"]["how_to_comfort"] = reflection["how_to_comfort"]
    if "values" in reflection:
        for v in reflection["values"]:
            if v not in profile["values"]:
                profile["values"].append(v)
    if "what_she_needs" in reflection:
        for n in reflection["what_she_needs"]:
            if n not in profile["what_she_needs_from_me"]:
                profile["what_she_needs_from_me"].append(n)
    if "notes" in reflection:
        profile["notes"].append(reflection["notes"])

    profile["total_messages_analyzed"] += reflection.get("messages_analyzed", 0)
    save_profile(profile)
