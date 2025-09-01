from fastapi import APIRouter, Form, Depends, HTTPException
from fastapi.responses import StreamingResponse
from schemas.gemini_schemas import AskRequest, AskImageRequest
from schemas.user_schemas import UserBase
from dal_files.gemini_dal import SessionManager
import base64
import io
import PIL.Image
import requests
import time
import asyncio
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
    try:
        # Generate a unique request ID
        request_id = f"ask-{validated_user.uid}-{int(time.time()*1000)}"
        
        # Create a task to setup the session and send input
        # This allows us to return the streaming response quickly while setup happens in background
        setup_task = asyncio.create_task(
            setup_session_and_send_input(validated_user.uid, request_id, request.text)
        )
        
        # Create a streaming response for audio data immediately
        async def audio_stream():
            interrupted = False
            
            try:
                # Wait for session setup to complete or timeout
                try:
                    await asyncio.wait_for(setup_task, timeout=5.0)
                except asyncio.TimeoutError:
                    print(f"Session setup timed out for request {request_id}")
                    yield bytes([0xFE] * 32)  # Error signal
                    return
                
                # Ensure we have a queue to read from
                if validated_user.uid not in session_manager.audio_queues:
                    session_manager.audio_queues[validated_user.uid] = asyncio.Queue()
                
                while True:
                    # Use a timeout to avoid blocking the stream for too long
                    try:
                        audio_data = await asyncio.wait_for(
                            session_manager.audio_queues[validated_user.uid].get(),
                            timeout=30.0  # 30 seconds timeout
                        )
                    except asyncio.TimeoutError:
                        print(f"Timeout waiting for audio data in request {request_id}")
                        if not interrupted:
                            yield bytes([0xFE] * 32)  # Error signal
                        break
                    
                    # Check for special interruption marker (0xFF bytes)
                    if len(audio_data) == 32 and all(b == 0xFF for b in audio_data):
                        print(f"Request {request_id} interrupted")
                        interrupted = True
                        # Send a special marker that the client can detect
                        yield bytes([0xFF] * 32)
                        # Then end the stream so client can start a new request
                        break
                    
                    # Check for error marker (0xFE bytes)
                    elif len(audio_data) == 32 and all(b == 0xFE for b in audio_data):
                        print(f"Error in request {request_id}")
                        # Send a special marker that the client can detect as an error
                        yield bytes([0xFE] * 32)
                        break
                        
                    # Normal audio data
                    else:
                        yield audio_data
                        
                    # If request ID doesn't match the active one anymore, end the stream
                    if validated_user.uid in session_manager.active_request_ids and \
                       session_manager.active_request_ids[validated_user.uid] != request_id:
                        print(f"Request {request_id} superseded by newer request")
                        if not interrupted:
                            yield bytes([0xFF] * 32)  # Signal interruption
                        break
            except Exception as e:
                print(f"Error in audio stream for user {validated_user.uid}: {e}")
                # Signal error to client
                yield bytes([0xFE] * 32)
                
        # Return the streaming response with request ID immediately
        return StreamingResponse(
            audio_stream(),
            media_type="audio/pcm",
            headers={"X-Request-ID": request_id}
        )
    except Exception as e:
        print(f"Error in ask endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

async def setup_session_and_send_input(user_id, request_id, text):
    """Setup session and send input asynchronously to avoid blocking the response."""
    try:
        # Get or create a session with the request ID
        session = await session_manager.get_or_create_session(user_id, request_id)
        
        # Send the activity start signal
        await session.send_realtime_input(activity_start=types.ActivityStart())
        
        # Send the text input
        await session.send_realtime_input(text=text)
        
        # Send the activity end signal
        await session.send_realtime_input(activity_end=types.ActivityEnd())
    except Exception as e:
        print(f"Error in setup_session_and_send_input: {e}")
        # Make sure we have a queue to put the error signal into
        if user_id not in session_manager.audio_queues:
            session_manager.audio_queues[user_id] = asyncio.Queue()
        await session_manager.audio_queues[user_id].put(bytes([0xFE] * 32))

@router.post("/ask-image")
async def ask_image(model: AskImageRequest, current_user: UserBase = Depends(get_current_user), _=Depends(validate_daily_usage_limit)):
    try:
        # Generate a unique request ID
        request_id = f"img-{current_user.uid}-{int(time.time()*1000)}"
        
        if current_user.uid not in users:
            users.add(current_user.uid)
            
        # Start processing the image in the background (this can be slow)
        process_task = asyncio.create_task(
            process_image_and_setup_session(current_user.uid, request_id, model.url, model.text)
        )
        
        # Create a streaming response for audio data immediately
        async def audio_stream():
            interrupted = False
            
            try:
                # Wait for image processing and session setup to complete or timeout
                try:
                    await asyncio.wait_for(process_task, timeout=10.0)  # Images need more time
                except asyncio.TimeoutError:
                    print(f"Image processing timed out for request {request_id}")
                    yield bytes([0xFE] * 32)  # Error signal
                    return
                
                # Ensure we have a queue to read from
                if current_user.uid not in session_manager.audio_queues:
                    session_manager.audio_queues[current_user.uid] = asyncio.Queue()
                
                while True:
                    # Use a timeout to avoid blocking the stream for too long
                    try:
                        audio_data = await asyncio.wait_for(
                            session_manager.audio_queues[current_user.uid].get(),
                            timeout=30.0  # 30 seconds timeout
                        )
                    except asyncio.TimeoutError:
                        print(f"Timeout waiting for audio data in request {request_id}")
                        if not interrupted:
                            yield bytes([0xFE] * 32)  # Error signal
                        break
                    
                    # Check for special interruption marker (0xFF bytes)
                    if len(audio_data) == 32 and all(b == 0xFF for b in audio_data):
                        print(f"Request {request_id} interrupted")
                        interrupted = True
                        # Send a special marker that the client can detect
                        yield bytes([0xFF] * 32)
                        # Then end the stream so client can start a new request
                        break
                    
                    # Check for error marker (0xFE bytes)
                    elif len(audio_data) == 32 and all(b == 0xFE for b in audio_data):
                        print(f"Error in request {request_id}")
                        # Send a special marker that the client can detect as an error
                        yield bytes([0xFE] * 32)
                        break
                        
                    # Normal audio data
                    else:
                        yield audio_data
                        
                    # If request ID doesn't match the active one anymore, end the stream
                    if current_user.uid in session_manager.active_request_ids and \
                       session_manager.active_request_ids[current_user.uid] != request_id:
                        print(f"Request {request_id} superseded by newer request")
                        if not interrupted:
                            yield bytes([0xFF] * 32)  # Signal interruption
                        break
            except Exception as e:
                print(f"Error in audio stream for user {current_user.uid}: {e}")
                # Signal error to client
                yield bytes([0xFE] * 32)
                
        # Return the streaming response with request ID immediately
        return StreamingResponse(
            audio_stream(),
            media_type="audio/pcm",
            headers={"X-Request-ID": request_id}
        )
    except Exception as e:
        print(f"Error in ask-image endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

async def process_image_and_setup_session(user_id, request_id, image_url, text):
    """Process image and setup session asynchronously."""
    try:
        # Load and process the image
        try:
            response = await asyncio.to_thread(requests.get, image_url)
            response.raise_for_status()
            img_bytes = response.content
            
            # Process image in a thread to not block the event loop
            img = await asyncio.to_thread(PIL.Image.open, io.BytesIO(img_bytes))
            if img.mode != 'RGB':
                img = await asyncio.to_thread(img.convert, 'RGB')
            img = await asyncio.to_thread(lambda i: i.thumbnail([1024, 1024]) or i, img)
            
            image_io = io.BytesIO()
            await asyncio.to_thread(img.save, image_io, format="JPEG")
            image_bytes = image_io.getvalue()
        except Exception as e:
            print(f"Error processing image: {e}")
            # Make sure we have a queue to put the error signal into
            if user_id not in session_manager.audio_queues:
                session_manager.audio_queues[user_id] = asyncio.Queue()
            await session_manager.audio_queues[user_id].put(bytes([0xFE] * 32))
            return
            
        # Get or create a session with the request ID
        session = await session_manager.get_or_create_session(user_id, request_id)
        
        # Prepare and send the image + text
        image_b64 = base64.b64encode(image_bytes).decode("utf-8")
        image_part = types.Part(inline_data=types.Blob(data=image_b64, mime_type="image/jpeg"))
        image_part.inline_data.data = image_b64
        
        # Send the content to the model
        await session.send_client_content(
            turns=types.Content(role="user", parts=[image_part, types.Part(text=text)]),
            turn_complete=True
        )
    except Exception as e:
        print(f"Error in process_image_and_setup_session: {e}")
        # Make sure we have a queue to put the error signal into
        if user_id not in session_manager.audio_queues:
            session_manager.audio_queues[user_id] = asyncio.Queue()
        await session_manager.audio_queues[user_id].put(bytes([0xFE] * 32))