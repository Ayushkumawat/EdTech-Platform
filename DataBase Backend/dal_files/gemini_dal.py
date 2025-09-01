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
        self.active_request_ids: Dict[str, str] = {}  # Track active request IDs per user
        self.interrupt_flags: Dict[str, bool] = {}  # Flag to signal interruption
    
    async def get_or_create_session(self, user_id, request_id=None):
        # Set interrupt flag immediately to stop any ongoing processing
        self.interrupt_flags[user_id] = True
        
        # Cancel existing request for this user if there is one
        if request_id and user_id in self.active_request_ids:
            old_request_id = self.active_request_ids[user_id]
            if old_request_id != request_id:
                print(f"Cancelling previous request {old_request_id} for user {user_id}")
                # Send interrupt signal immediately before queue might be cleared
                if user_id in self.audio_queues:
                    try:
                        await self.audio_queues[user_id].put(bytes([0xFF] * 32))
                    except:
                        pass
            
        if request_id:
            self.active_request_ids[user_id] = request_id
        
        # Reset existing session if it exists to ensure clean state
        if user_id in self.sessions:
            # Cancel existing receive task if any
            if user_id in self.receive_tasks and not self.receive_tasks[user_id].done():
                self.receive_tasks[user_id].cancel()
                try:
                    # Use a shorter timeout to reduce delay
                    await asyncio.wait_for(self.receive_tasks[user_id], timeout=0.1)
                except (asyncio.TimeoutError, asyncio.CancelledError):
                    pass
                    
            # Clear audio queue - more efficient with a new queue
            if user_id in self.audio_queues:
                # Instead of clearing the queue item by item, just create a new one
                self.audio_queues[user_id] = asyncio.Queue()
                    
            # Close existing connection if any - do this async to not block
            if user_id in self._connection_contexts:
                asyncio.create_task(self._close_connection(user_id))
        
        # Create new session
        connection = client.aio.live.connect(model=MODEL, config=CONFIG)
        self._connection_contexts[user_id] = connection
        self.sessions[user_id] = await connection.__aenter__()
        
        # Create fresh queue if needed
        if user_id not in self.audio_queues:
            self.audio_queues[user_id] = asyncio.Queue()
        
        # Reset interrupt flag as we're ready for new requests
        self.interrupt_flags[user_id] = False
        
        # Start new receive task
        self.receive_tasks[user_id] = asyncio.create_task(self.receive_audio(user_id))
        
        return self.sessions[user_id]
    
    async def _close_connection(self, user_id):
        """Asynchronously close a connection without blocking the main flow."""
        try:
            await self._connection_contexts[user_id].__aexit__(None, None, None)
        except Exception as e:
            print(f"Error closing connection for user {user_id}: {e}")
    
    async def update_token_usage(self, user_id: str, tokens: int, db_session: AsyncSession):
        user = await user_service.get_user_by_id(user_id, db_session)
        
        await user_service.update_user(
                user_id=user_id,
                user_data=UserUpdate(daily_usage=user.daily_usage + tokens),
                db_session=db_session
            )
        return user.daily_usage + tokens
    
    async def receive_audio(self, user_id):
        session = self.sessions[user_id]
        interrupt_signal_sent = False
        
        try:
            while True:
                # Check if we have an interrupt flag set before processing
                if user_id in self.interrupt_flags and self.interrupt_flags[user_id]:
                    print(f"Interrupting receive_audio for user {user_id}")
                    # Skip further processing for this iteration
                    await asyncio.sleep(0.01)  # Tiny delay to avoid tight loop
                    continue
                
                # Process model responses
                turn = session.receive()
                async for response in turn:
                    # Check again for interruption
                    if user_id in self.interrupt_flags and self.interrupt_flags[user_id]:
                        break
                        
                    sc = getattr(response, "server_content", None)
                    if sc is None:
                        continue
                        
                    # Handle interruption
                    if sc.interrupted:
                        print(f"Session interrupted for user {user_id}")
                        
                        # Clear audio queue with a more efficient approach
                        if user_id in self.audio_queues:
                            # Replace queue instead of emptying it
                            self.audio_queues[user_id] = asyncio.Queue()
                            # Put interrupt signal in new queue
                            await self.audio_queues[user_id].put(bytes([0xFF] * 32))
                            interrupt_signal_sent = True
                            
                        # Skip this response since it was interrupted
                        break
                        
                    # Process model turn more efficiently
                    if sc.model_turn is not None:
                        for part in sc.model_turn.parts:
                            # Check for interruption before processing each part
                            if user_id in self.interrupt_flags and self.interrupt_flags[user_id]:
                                break
                                
                            if part.inline_data and part.inline_data.mime_type.startswith("audio/pcm"):
                                if user_id in self.audio_queues:
                                    # Use put_nowait when possible to avoid blocking
                                    try:
                                        # For small buffers, use put_nowait to avoid awaiting
                                        if len(part.inline_data.data) < 10000:  # Small buffer threshold
                                            self.audio_queues[user_id].put_nowait(part.inline_data.data)
                                        else:
                                            await self.audio_queues[user_id].put(part.inline_data.data)
                                    except asyncio.QueueFull:
                                        # If queue is full, we're likely backing up - just continue
                                        continue
                            elif part.text:
                                print(part.text, end="", flush=True)
                                
                    # Process usage metadata - this is less time-sensitive so keep as is
                    if response.usage_metadata:
                        usage = response.usage_metadata
                        total_used_tokens = usage.total_token_count
                        print(f"Used {total_used_tokens} tokens in total")
                        
                        # Update token usage in database - do this as a background task
                        asyncio.create_task(self._update_token_usage(user_id, total_used_tokens))
                
                # If we've processed a turn, reset the interrupt flag
                if user_id in self.interrupt_flags:
                    self.interrupt_flags[user_id] = False
        except asyncio.CancelledError:
            print(f"Receive task cancelled for user {user_id}")
            # Signal the client that the connection was cancelled
            if user_id in self.audio_queues:
                try:
                    self.audio_queues[user_id].put_nowait(bytes([0xFF] * 32))
                except:
                    # If queue is full or closed, create a new one
                    self.audio_queues[user_id] = asyncio.Queue()
                    await self.audio_queues[user_id].put(bytes([0xFF] * 32))
            return
        except Exception as e:
            print(f"Error in receive_audio for session {user_id}: {e}")
            # Try to clean up and signal error to client
            if user_id in self.audio_queues:
                try:
                    # Signal error with different marker
                    self.audio_queues[user_id].put_nowait(bytes([0xFE] * 32))
                except:
                    # If queue is full or closed, create a new one
                    self.audio_queues[user_id] = asyncio.Queue()
                    await self.audio_queues[user_id].put(bytes([0xFE] * 32))
    
    async def _update_token_usage(self, user_id, total_used_tokens):
        """Background task to update token usage without blocking the main flow."""
        try:
            async for db_session in get_session():
                await self.update_token_usage(user_id, total_used_tokens, db_session)
                break
        except Exception as e:
            print(f"Error updating token usage for user {user_id}: {e}")
