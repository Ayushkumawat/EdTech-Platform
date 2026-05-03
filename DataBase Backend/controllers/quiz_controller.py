from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from dal_files.quiz_dal import QuizDAL
from db.database import get_session
from db.redis_store import get_redis_client
from dependencies import get_current_user
from schemas.quiz_schemas import (
    AttemptHistoryOut,
    AttemptResultOut,
    AttemptStartOut,
    AttemptSubmitIn,
    QuizSummaryOut,
)
from schemas.user_schemas import UserOut

quiz_router = APIRouter()
quiz_service = QuizDAL()

SUBMIT_RATE_LIMIT_KEY = "quiz_submit_rl:{user_id}"
SUBMIT_RATE_LIMIT_SECONDS = 2


@quiz_router.get("/chapter/{chapter_id}/summary", response_model=QuizSummaryOut, status_code=status.HTTP_200_OK)
async def get_quiz_summary(
    chapter_id: UUID,
    current_user: UserOut = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    return await quiz_service.get_quiz_summary(chapter_id, current_user.uid, session)


@quiz_router.post("/chapter/{chapter_id}/attempts/start", response_model=AttemptStartOut, status_code=status.HTTP_201_CREATED)
async def start_attempt(
    chapter_id: UUID,
    current_user: UserOut = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    result = await quiz_service.start_attempt(chapter_id, current_user.uid, session)
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No questions seeded for this chapter yet.",
        )
    return result


@quiz_router.post("/attempts/{attempt_id}/submit", response_model=AttemptResultOut, status_code=status.HTTP_200_OK)
async def submit_attempt(
    attempt_id: UUID,
    model: AttemptSubmitIn,
    current_user: UserOut = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    redis = await get_redis_client()
    rate_key = SUBMIT_RATE_LIMIT_KEY.format(user_id=str(current_user.uid))
    is_limited = await redis.set(rate_key, "1", ex=SUBMIT_RATE_LIMIT_SECONDS, nx=True)
    if is_limited is None:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Please wait before submitting again.",
        )

    try:
        result = await quiz_service.submit_attempt(attempt_id, model.answers, current_user.uid, session)
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    except KeyError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attempt not found.")
    return result


@quiz_router.get("/attempts/me/chapter/{chapter_id}", response_model=AttemptHistoryOut, status_code=status.HTTP_200_OK)
async def list_my_attempts(
    chapter_id: UUID,
    current_user: UserOut = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    return await quiz_service.list_user_attempts(chapter_id, current_user.uid, session)
