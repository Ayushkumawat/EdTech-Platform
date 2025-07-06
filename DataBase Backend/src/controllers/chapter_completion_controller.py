from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from schemas.chapter_completion_schemas import ChapterCompletionCreate, ChapterCompletionOut, ChapterCompletionUpdate
from db.database import get_session
from dal_files.chapter_completion_dal import ChapterCompletionDAL

chapter_completion_router = APIRouter()
chapter_completion_service = ChapterCompletionDAL()

@chapter_completion_router.post("/", response_model=ChapterCompletionOut, status_code=status.HTTP_201_CREATED)
async def create_chapter_completion(model: ChapterCompletionCreate, session: AsyncSession = Depends(get_session)):
    created = await chapter_completion_service.create_chapter_completion(model, session)
    return created

@chapter_completion_router.get("/{chapter_completion_id}", response_model=ChapterCompletionOut, status_code=status.HTTP_200_OK)
async def get_chapter_completion_by_id(chapter_completion_id: str, session: AsyncSession = Depends(get_session)):
    model = await chapter_completion_service.get_chapter_completion_by_id(chapter_completion_id, session)
    if not model:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chapter completion not found.")
    return model

@chapter_completion_router.get("/", response_model=list[ChapterCompletionOut], status_code=status.HTTP_200_OK)
async def get_all_chapter_completions(session: AsyncSession = Depends(get_session)):
    models = await chapter_completion_service.get_all_chapter_completions(session)
    return models

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
