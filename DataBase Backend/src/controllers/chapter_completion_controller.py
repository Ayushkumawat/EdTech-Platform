from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from schemas.chapter_completion_schemas import ChapterCompletionCreate, ChapterCompletionOut, ChapterCompletionUpdate, ChapterPageOut
from db.database import get_session
from dal_files.chapter_completion_dal import ChapterCompletionDAL
from schemas.user_schemas import UserBase
from dependencies import get_current_user
from uuid import UUID

chapter_completion_router = APIRouter()
chapter_completion_service = ChapterCompletionDAL()



@chapter_completion_router.get("/", response_model=list[ChapterCompletionOut], status_code=status.HTTP_200_OK)
async def get_all_chapter_completions(session: AsyncSession = Depends(get_session)):
    models = await chapter_completion_service.get_all_chapter_completions(session)
    return models

@chapter_completion_router.get("/{chapter_id}", response_model=ChapterPageOut, status_code=status.HTTP_200_OK)
async def get_current_page(chapter_id: UUID, current_user: UserBase = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    current_page = await chapter_completion_service.get_current_page(chapter_id, current_user.uid, session)
    return current_page

@chapter_completion_router.put("/{chapter_completion_id}", response_model=ChapterCompletionOut, status_code=status.HTTP_200_OK)
async def update_chapter_completion(chapter_completion_id: str, model: ChapterCompletionUpdate, session: AsyncSession = Depends(get_session)):
    updated = await chapter_completion_service.update_chapter_completion(chapter_completion_id, model, session)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chapter completion not found.")
    return updated

@chapter_completion_router.delete("/{chapter_completion_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_chapter_completion(chapter_completion_id: str, session: AsyncSession = Depends(get_session)):
    deleted = await chapter_completion_service.delete_chapter_completion(chapter_completion_id, session)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chapter completion not found.")
    return
