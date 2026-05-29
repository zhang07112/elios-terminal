import sys
import os
import asyncio
import json
from contextlib import asynccontextmanager
from typing import Optional

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from src.elios import EliosEngine
from src.memory_advanced import MemoryEngine, load_memory_cards, get_relevant_cards, cards_to_prompt
from src.active import ProactiveEngine
from src.tools import check_message_for_tools, tools_to_context
from src.calendar_tool import add_event, get_today_events, get_upcoming_events, add_health_record, get_latest_health
from src.config import OPENAI_MODEL
from src.supabase_client import save_conversation_sync, get_conversations_sync, get_profile_sync

elios = EliosEngine()
memory = MemoryEngine()
proactive = ProactiveEngine()

connected_websockets = set()


@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(proactive_loop())
    yield
    task.cancel()


app = FastAPI(title="Elios API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def proactive_loop():
    while True:
        await asyncio.sleep(30)
        try:
            msg = proactive.check()
            if msg:
                for ws in connected_websockets.copy():
                    try:
                        await ws.send_json({"type": "proactive", "message": msg})
                    except Exception:
                        connected_websockets.discard(ws)
        except Exception:
            pass


class ChatRequest(BaseModel):
    message: str
    model: str = ""


class ChatResponse(BaseModel):
    reply: str


@app.get("/")
def root():
    return {"status": "ok", "elios": "online"}


@app.post("/chat", response_model=ChatResponse)
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


@app.get("/profile")
def profile():
    try:
        supabase_profile = get_profile_sync()
        if supabase_profile:
            return {"profile": elios.get_profile_summary(), "supabase_profile": supabase_profile}
    except Exception as e:
        print(f"Failed to get profile: {e}")
    return {"profile": elios.get_profile_summary()}


@app.get("/messages")
def messages(limit: int = 100):
    try:
        return {"messages": get_conversations_sync(limit)}
    except Exception as e:
        print(f"Failed to get messages: {e}")
        return {"messages": []}


@app.get("/cards")
def cards():
    return {"cards": load_memory_cards()}


@app.post("/dream")
def dream():
    diary = memory.dream()
    cards = load_memory_cards()
    return {"diary": diary or "今天还没什么可写的", "cards": cards}


@app.post("/schedule")
def schedule(title: str = "", date: str = "", note: str = ""):
    if title:
        add_event(title, date, note)
    return {
        "today": [{"title": e["title"], "date": e.get("date", "")} for e in get_today_events()],
        "upcoming": [{"title": e["title"], "date": e.get("date", "")} for e in get_upcoming_events(7)],
    }


@app.post("/health")
def health(record_type: str = "", value: str = "", note: str = ""):
    if record_type:
        add_health_record(record_type, value, note)
    return {"records": [{"type": r["type"], "value": r["value"]} for r in get_latest_health()]}


@app.get("/models")
def models():
    return {"models": ["deepseek-chat", "gpt-4o-mini", "gpt-4o"], "current": OPENAI_MODEL}


@app.get("/cost")
def cost():
    return {"cost": elios.get_cost_summary()}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_websockets.add(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)
            if msg.get("type") == "ping":
                await websocket.send_json({"type": "pong"})
    except WebSocketDisconnect:
        connected_websockets.discard(websocket)
    except Exception:
        connected_websockets.discard(websocket)
