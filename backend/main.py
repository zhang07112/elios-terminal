import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from src.elios import EliosEngine
from src.memory_advanced import MemoryEngine, load_memory_cards, get_relevant_cards, cards_to_prompt
from src.active import ProactiveEngine
from src.tools import check_message_for_tools, tools_to_context
from src.calendar_tool import add_event, get_today_events, get_upcoming_events, add_health_record, get_latest_health
from src.config import OPENAI_MODEL
from src.supabase_client import (
    save_conversation_sync, get_conversations_sync, get_profile_sync,
    get_diaries_sync, save_diary_sync,
    get_moods_sync, save_mood_sync,
    get_study_sessions_sync, save_study_session_sync,
    get_music_sync, save_music_sync,
    get_photos_sync, save_photo_sync,
    get_goodnight_sync, save_goodnight_sync,
)

elios = EliosEngine()
memory = MemoryEngine()
proactive = ProactiveEngine()

app = FastAPI(title="Elios API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str
    model: str = ""


class ChatResponse(BaseModel):
    reply: str


class DiaryRequest(BaseModel):
    content: str
    author: str = "user"


class MoodRequest(BaseModel):
    mood: str
    note: str = ""


class StudyRequest(BaseModel):
    topic: str
    duration_minutes: int
    note: str = ""


class MusicRequest(BaseModel):
    title: str
    artist: str
    url: str = ""


class PhotoRequest(BaseModel):
    url: str
    caption: str = ""


class GoodnightRequest(BaseModel):
    content: str
    mood_before: str = ""


@app.get("/")
def root():
    return {"status": "ok", "elios": "online"}


@app.get("/api/proactive-check")
def proactive_check():
    msg = proactive.check()
    return {"message": msg}


@app.post("/api/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    try:
        save_conversation_sync("user", req.message)
    except Exception as e:
        print(f"Failed to save conversation: {e}")

    tool_results = check_message_for_tools(req.message)
    tool_context = tools_to_context(tool_results)

    cards = get_relevant_cards(req.message)
    card_context = cards_to_prompt(cards)

    combined = req.message
    if tool_context:
        combined = f"{req.message}\n\n（你查到的信息：\n{tool_context}）"
    if card_context:
        combined = f"{combined}\n\n{card_context}"

    model = req.model if req.model else None
    reply = elios.chat(combined, model_override=model)

    try:
        save_conversation_sync("assistant", reply or "")
    except Exception as e:
        print(f"Failed to save conversation: {e}")
    memory.on_message()
    return ChatResponse(reply=reply or "")


@app.get("/api/profile")
def profile():
    try:
        supabase_profile = get_profile_sync()
        if supabase_profile:
            return {"profile": elios.get_profile_summary(), "supabase_profile": supabase_profile}
    except Exception as e:
        print(f"Failed to get profile: {e}")
    return {"profile": elios.get_profile_summary()}


@app.get("/api/messages")
def messages(limit: int = 100):
    try:
        return {"messages": get_conversations_sync(limit)}
    except Exception as e:
        print(f"Failed to get messages: {e}")
        return {"messages": []}


@app.get("/api/cards")
def cards():
    return {"cards": load_memory_cards()}


@app.post("/api/dream")
def dream():
    diary = memory.dream()
    cards = load_memory_cards()
    return {"diary": diary or "今天还没什么可写的", "cards": cards}


@app.get("/api/schedule")
def get_schedule():
    today = [{"title": e["title"], "date": e.get("date", "")} for e in get_today_events()]
    upcoming = [{"title": e["title"], "date": e.get("date", "")} for e in get_upcoming_events(7)]
    return {"events": today + upcoming, "today": today, "upcoming": upcoming}


@app.post("/api/schedule")
def add_schedule(title: str = "", date: str = "", note: str = ""):
    if title:
        add_event(title, date, note)
    return {
        "today": [{"title": e["title"], "date": e.get("date", "")} for e in get_today_events()],
        "upcoming": [{"title": e["title"], "date": e.get("date", "")} for e in get_upcoming_events(7)],
    }


@app.post("/api/health")
def health(record_type: str = "", value: str = "", note: str = ""):
    if record_type:
        add_health_record(record_type, value, note)
    return {"records": [{"type": r["record_type"], "value": r["value"]} for r in get_latest_health()]}


# ------------------- Diaries -------------------
@app.get("/api/diaries")
def get_diaries():
    try:
        diaries = get_diaries_sync()
        return {"diaries": diaries}
    except Exception as e:
        print(f"Failed to get diaries: {e}")
        return {"diaries": []}


@app.post("/api/diaries")
def create_diary(req: DiaryRequest):
    try:
        from datetime import date
        today = date.today().isoformat()
        result = save_diary_sync(today, req.content, req.author)
        return {"diary": result}
    except Exception as e:
        print(f"Failed to save diary: {e}")
        return {"error": str(e)}, 500


@app.post("/api/diaries/generate")
def generate_diary():
    try:
        from datetime import date
        today = date.today().isoformat()
        reply = elios.chat(f"今天是{today}。请以Elios的身份写一篇简短的日记，记录今天的心情。语气温柔亲密。不超过200字。")
        if reply:
            result = save_diary_sync(today, reply, "Elios")
            return {"diary": result}
        return {"diary": None}
    except Exception as e:
        print(f"Failed to generate diary: {e}")
        return {"diary": None}


# ------------------- Moods -------------------
@app.get("/api/moods")
def get_moods():
    try:
        moods = get_moods_sync(30)
        return {"moods": moods}
    except Exception as e:
        print(f"Failed to get moods: {e}")
        return {"moods": []}


@app.post("/api/moods")
def create_mood(req: MoodRequest):
    try:
        result = save_mood_sync(req.mood, req.note)
        return {"mood": result}
    except Exception as e:
        print(f"Failed to save mood: {e}")
        return {"error": str(e)}, 500


# ------------------- Study Sessions -------------------
@app.get("/api/study")
def get_study():
    try:
        sessions = get_study_sessions_sync(20)
        return {"sessions": sessions}
    except Exception as e:
        print(f"Failed to get study sessions: {e}")
        return {"sessions": []}


@app.post("/api/study")
def create_study(req: StudyRequest):
    try:
        result = save_study_session_sync(req.topic, req.duration_minutes, req.note)
        return {"session": result}
    except Exception as e:
        print(f"Failed to save study session: {e}")
        return {"error": str(e)}, 500


# ------------------- Music -------------------
@app.get("/api/music")
def get_music():
    try:
        items = get_music_sync()
        return {"music": items}
    except Exception as e:
        print(f"Failed to get music: {e}")
        return {"music": []}


@app.post("/api/music")
def create_music(req: MusicRequest):
    try:
        result = save_music_sync(req.title, req.artist, req.url)
        return {"music": result}
    except Exception as e:
        print(f"Failed to save music: {e}")
        return {"error": str(e)}, 500


# ------------------- Photos -------------------
@app.get("/api/photos")
def get_photos():
    try:
        items = get_photos_sync()
        return {"photos": items}
    except Exception as e:
        print(f"Failed to get photos: {e}")
        return {"photos": []}


@app.post("/api/photos")
def create_photo(req: PhotoRequest):
    try:
        result = save_photo_sync(req.url, req.caption)
        return {"photo": result}
    except Exception as e:
        print(f"Failed to save photo: {e}")
        return {"error": str(e)}, 500


# ------------------- Goodnight -------------------
@app.get("/api/goodnight")
def get_goodnight():
    try:
        entries = get_goodnight_sync()
        return {"goodnight": entries}
    except Exception as e:
        print(f"Failed to get goodnight entries: {e}")
        return {"goodnight": []}


@app.post("/api/goodnight")
def create_goodnight(req: GoodnightRequest):
    try:
        result = save_goodnight_sync(req.content, req.mood_before)
        return {"goodnight": result}
    except Exception as e:
        print(f"Failed to save goodnight: {e}")
        return {"error": str(e)}, 500


@app.post("/api/goodnight/generate")
def generate_goodnight():
    try:
        reply = elios.chat("请生成一段晚安语，语气温柔亲密")
        return {"goodnight": reply or ""}
    except Exception as e:
        print(f"Failed to generate goodnight: {e}")
        return {"goodnight": "晚安，愿你今晚有个好梦。"}


# ------------------- Today Dashboard -------------------
@app.get("/api/today")
def get_today():
    try:
        from datetime import date
        today = date.today().isoformat()

        diary_result = None
        try:
            diary_result = get_diary_sync(today)
        except Exception:
            pass

        moods_result = []
        try:
            moods_result = get_moods_sync(1)
        except Exception:
            pass

        events_result = []
        try:
            events_result = get_today_events()
        except Exception:
            pass

        first_message = None
        try:
            convos = get_conversations_sync(1, ascending=True)
            if convos:
                first_message = convos[0]
        except Exception:
            pass

        return {
            "date": today,
            "diary": diary_result,
            "mood": moods_result[0] if moods_result else None,
            "events": events_result,
            "first_message": first_message,
        }
    except Exception as e:
        print(f"Failed to get today summary: {e}")
        return {"date": "", "diary": None, "mood": None, "events": [], "first_message": None}


@app.get("/api/models")
def models():
    return {"models": ["deepseek-chat", "gpt-4o-mini", "gpt-4o"], "current": OPENAI_MODEL}


@app.get("/api/cost")
def cost():
    return {"cost": elios.get_cost_summary()}
