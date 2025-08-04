from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from schemas.chapter_schemas import ChapterCreate, ChapterOut, ChapterUpdate
from db.database import get_session
from dal_files.chapter_dal import ChapterDAL

chapter_router = APIRouter()
chapter_service = ChapterDAL()

@chapter_router.post("/", response_model=ChapterOut, status_code=status.HTTP_201_CREATED)
async def create_chapter(model: ChapterCreate, session: AsyncSession = Depends(get_session)):
    created = await chapter_service.create_chapter(model, session)
    return created

@chapter_router.get("/{chapter_id}", response_model=ChapterOut, status_code=status.HTTP_200_OK)
async def get_chapter_by_id(chapter_id: str, session: AsyncSession = Depends(get_session)):
    model = await chapter_service.get_chapter_by_id(chapter_id, session)
    if not model:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chapter not found.")
    return model

@chapter_router.get("/", response_model=list[ChapterOut], status_code=status.HTTP_200_OK)
async def get_all_chapters(session: AsyncSession = Depends(get_session)):
    models = await chapter_service.get_all_chapters(session)
    return models

@chapter_router.put("/{chapter_id}", response_model=ChapterOut, status_code=status.HTTP_200_OK)
async def update_chapter(chapter_id: str, model: ChapterUpdate, session: AsyncSession = Depends(get_session)):
    updated = await chapter_service.update_chapter(chapter_id, model, session)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chapter not found.")
    return updated

@chapter_router.delete("/{chapter_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_chapter(chapter_id: str, session: AsyncSession = Depends(get_session)):
    deleted = await chapter_service.delete_chapter(chapter_id, session)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chapter not found.")
    return
