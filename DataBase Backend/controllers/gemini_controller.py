from fastapi import APIRouter, Form, Depends
from fastapi.responses import StreamingResponse
from schemas.gemini_schemas import AskRequest, AskImageRequest
from schemas.user_schemas import UserBase
from dal_files.gemini_dal import SessionManager
import base64
import io
import asyncio
import PIL.Image
import requests
from google.genai import types
from dependencies import validate_daily_usage_limit
from dependencies import get_current_user

router = APIRouter()

users = set()
session_manager = SessionManager()

@router.get("/messages/{user_id}")
async def get_messages(user_id: str):
    return [users[user_id]] if user_id in users else []

@router.post("/ask")
async def ask(request: AskRequest, validated_user=Depends(validate_daily_usage_limit)):
    session = await session_manager.get_or_create_session(validated_user.uid)
    session_manager.start_new_request(validated_user.uid)  # Mark new request start
    await session.send_realtime_input(activity_start=types.ActivityStart())
    await session.send_realtime_input(text=request.text)
    await session.send_realtime_input(activity_end=types.ActivityEnd())
    async def audio_stream():
        audio_chunks_received = 0
        timeout_count = 0
        max_timeout = 5  # Maximum seconds to wait for new audio data
        
        while True:
            try:
                # Use asyncio.wait_for to add timeout
                audio_data = await asyncio.wait_for(
                    session_manager.audio_queues[validated_user.uid].get(),
                    timeout=max_timeout
                )
                # Check if this is the end marker (None)
                if audio_data is None:
                    print(f"End of response detected for user {validated_user.uid}")
                    break
                yield audio_data
                audio_chunks_received += 1
                timeout_count = 0  # Reset timeout counter when we receive data
            except asyncio.TimeoutError:
                # If no audio data received for max_timeout seconds, end the stream
                print(f"Audio stream timeout for user {validated_user.uid} after {max_timeout} seconds")
                break
            except Exception as e:
                print(f"Error in audio stream for user {validated_user.uid}: {e}")
                break
    return StreamingResponse(
        audio_stream(),
        media_type="audio/pcm"
    )

@router.post("/ask-image")
async def ask_image(model: AskImageRequest, current_user: UserBase = Depends(get_current_user), _=Depends(validate_daily_usage_limit)):
    if current_user.uid not in users:
        users.add(current_user.uid)
    try:
        response = requests.get(model.url)
        response.raise_for_status()
        img_bytes = response.content
        img = PIL.Image.open(io.BytesIO(img_bytes))
        if img.mode != 'RGB':
            img = img.convert('RGB')
        img.thumbnail([1024, 1024])
        image_io = io.BytesIO()
        img.save(image_io, format="JPEG")
        image_bytes = image_io.getvalue()
    except Exception as e:
        return {"error": f"Error loading image from URL: {e}"}
    session = await session_manager.get_or_create_session(current_user.uid)
    session_manager.start_new_request(current_user.uid)  # Mark new request start
    image_b64 = base64.b64encode(image_bytes).decode("utf-8")
    image_part = types.Part(inline_data=types.Blob(data=image_b64, mime_type="image/jpeg"))
    image_part.inline_data.data = image_b64
    await session.send_client_content(
        turns=types.Content(role="user", parts=[image_part, types.Part(text=model.text)]),
        turn_complete=True
    )
    async def audio_stream():
        audio_chunks_received = 0
        timeout_count = 0
        max_timeout = 5  # Maximum seconds to wait for new audio data
        
        while True:
            try:
                # Use asyncio.wait_for to add timeout
                audio_data = await asyncio.wait_for(
                    session_manager.audio_queues[current_user.uid].get(),
                    timeout=max_timeout
                )
                # Check if this is the end marker (None)
                if audio_data is None:
                    print(f"End of response detected for user {current_user.uid}")
                    break
                yield audio_data
                audio_chunks_received += 1
                timeout_count = 0  # Reset timeout counter when we receive data
            except asyncio.TimeoutError:
                # If no audio data received for max_timeout seconds, end the stream
                print(f"Audio stream timeout for user {current_user.uid} after {max_timeout} seconds")
                break
            except Exception as e:
                print(f"Error in audio stream for user {current_user.uid}: {e}")
                break
    return StreamingResponse(
        audio_stream(),
        media_type="audio/pcm",
        # headers={"X-User-ID": current_user.uid}
    )