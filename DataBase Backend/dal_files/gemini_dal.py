import asyncio
from typing import Dict, Any
from google import genai
from google.genai import types
import os
from dal_files.user_dal import UserDAL
from dotenv import load_dotenv
from schemas.user_schemas import UserUpdate
from sqlalchemy.ext.asyncio import AsyncSession
from db.database import get_session
from fastapi import Depends

load_dotenv()

user_service = UserDAL()

MODEL = "models/gemini-2.5-flash-preview-native-audio-dialog"

client = genai.Client(
    http_options={"api_version": "v1beta"},
    api_key=os.getenv("GEMINI_API_KEY"),
)

CONFIG = types.LiveConnectConfig(
    response_modalities=["AUDIO"],
    media_resolution="MEDIA_RESOLUTION_MEDIUM",
    speech_config=types.SpeechConfig(
        voice_config=types.VoiceConfig(
            prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name="Zephyr")
        )
    ),
    context_window_compression=types.ContextWindowCompressionConfig(
        trigger_tokens=25600,
        sliding_window=types.SlidingWindow(target_tokens=12800),
    ),
    system_instruction="""reply to user in a friendly way""",
    realtime_input_config=types.RealtimeInputConfig(
        activity_handling="START_OF_ACTIVITY_INTERRUPTS",
        automatic_activity_detection={"disabled": True},
    ),
)

class SessionManager:
    def __init__(self):
        self.sessions: Dict[str, Any] = {}
        self._connection_contexts: Dict[str, Any] = {}
        self.audio_queues: Dict[str, asyncio.Queue] = {}
        self.receive_tasks: Dict[str, asyncio.Task] = {}
        self.token_usage: Dict[str, int] = {}  # Store total_used_tokens per user
        self.response_complete: Dict[str, bool] = {}  # Track if response is complete for each user
    
    async def get_or_create_session(self, user_id):
        if user_id not in self.sessions:
            connection = client.aio.live.connect(model=MODEL, config=CONFIG)
            self._connection_contexts[user_id] = connection
            self.sessions[user_id] = await connection.__aenter__()
            self.audio_queues[user_id] = asyncio.Queue()
            self.receive_tasks[user_id] = asyncio.create_task(self.receive_audio(user_id))
            self.response_complete[user_id] = False
        return self.sessions[user_id]
    
    async def update_token_usage(self, user_id: str, tokens: int, db_session: AsyncSession):
        user = await user_service.get_user_by_id(user_id, db_session)
        
        await user_service.update_user(
                user_id=user_id,
                user_data=UserUpdate(daily_usage=user.daily_usage + tokens),
                db_session=db_session
            )
        return user.daily_usage + tokens
    
    def start_new_request(self, user_id: str):
        """Mark that a new request has started for this user"""
        self.response_complete[user_id] = False
    
    def is_response_complete(self, user_id: str) -> bool:
        """Check if the response is complete for this user"""
        return self.response_complete.get(user_id, False)
    
    async def receive_audio(self, user_id):
        session = self.sessions[user_id]
        while True:
            try:
                turn = session.receive()
                async for response in turn:
                    sc = getattr(response, "server_content", None)
                    if sc is None:
                        continue
                    if sc.interrupted:
                        while not self.audio_queues[user_id].empty():
                            self.audio_queues[user_id].get_nowait()
                        continue
                    if sc.model_turn is not None:
                        for part in sc.model_turn.parts:
                            if part.inline_data and part.inline_data.mime_type.startswith("audio/pcm"):
                                await self.audio_queues[user_id].put(part.inline_data.data)
                            elif part.text:
                                print(part.text, end="", flush=True)
                    if response.usage_metadata:
                        usage = response.usage_metadata
                        total_used_tokens = usage.total_token_count
                        print(f"Used total - {usage.total_token_count} tokens in total. Response token breakdown:")
                        print(f"Used response - {usage.response_token_count} tokens in total. Response token breakdown:")
                        print(f"Used prompt - {usage.prompt_token_count} tokens in total. Response token breakdown:")
                        async for db_session in get_session():
                            await self.update_token_usage(user_id, total_used_tokens, db_session)
                            break
                        for detail in usage.response_tokens_details:
                            match detail:
                                case types.ModalityTokenCount(modality=modality, token_count=count):
                                    print(f"{modality}: {count}", flush=True)
                                    print(f"{modality}: {count}", flush=True)
                        # Mark response as complete when we receive usage metadata
                        self.response_complete[user_id] = True
                        # Put a special marker in the queue to signal end of response
                        await self.audio_queues[user_id].put(None)
            except Exception as e:
                print(f"Error in receive_audio for session {user_id}: {e}")
                break
