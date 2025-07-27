from fastapi import APIRouter, Form, Depends
from fastapi.responses import StreamingResponse
from schemas.gemini_schemas import AskRequest, AskImageRequest
from schemas.user_schemas import UserBase
from dal_files.gemini_dal import SessionManager
import base64
import io
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
    await session.send_realtime_input(activity_start=types.ActivityStart())
    await session.send_realtime_input(text=request.text)
    await session.send_realtime_input(activity_end=types.ActivityEnd())
    async def audio_stream():
        while True:
            try:
                audio_data = await session_manager.audio_queues[validated_user.uid].get()
                yield audio_data
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
    image_b64 = base64.b64encode(image_bytes).decode("utf-8")
    image_part = types.Part(inline_data=types.Blob(data=image_b64, mime_type="image/jpeg"))
    image_part.inline_data.data = image_b64
    await session.send_client_content(
        turns=types.Content(role="user", parts=[image_part, types.Part(text=model.text)]),
        turn_complete=True
    )
    async def audio_stream():
        while True:
            try:
                audio_data = await session_manager.audio_queues[current_user.uid].get()
                yield audio_data
            except Exception as e:
                print(f"Error in audio stream for user {current_user.uid}: {e}")
                break
    return StreamingResponse(
        audio_stream(),
        media_type="audio/pcm",
        # headers={"X-User-ID": current_user.uid}
    )