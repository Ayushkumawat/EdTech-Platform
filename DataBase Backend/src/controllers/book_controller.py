from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from schemas.book_schemas import BookCreate, BookOut, BookUpdate, BookListOut
from db.database import get_session
from dal_files.book_dal import BookDAL
from typing import List

book_router = APIRouter()
book_service = BookDAL()


@book_router.post("/", response_model=BookOut, status_code=status.HTTP_201_CREATED)
async def create_book(model: BookCreate, session: AsyncSession = Depends(get_session)):
    created = await book_service.create_book(model, session)
    return created

@book_router.get("/", response_model=List[BookOut], status_code=status.HTTP_200_OK)
async def get_all_books(session: AsyncSession = Depends(get_session)):
    models = await book_service.get_all_books(session)
    return models

@book_router.get("/{book_id}", response_model=BookOut, status_code=status.HTTP_200_OK)
async def get_book_by_id(book_id: str, session: AsyncSession = Depends(get_session)):
    model = await book_service.get_book_by_id(book_id, session)
    if not model:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found.")
    return model

@book_router.get("/subject/{subject_id}", response_model=List[BookListOut], status_code=status.HTTP_200_OK)
async def get_book_by_subject_id(subject_id: str, session: AsyncSession = Depends(get_session)):
    model = await book_service.get_book_by_subject_id(subject_id, session)
    if not model:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found.")
    return model

@book_router.get("/class/{class_id}", response_model=List[BookListOut], status_code=status.HTTP_200_OK)
async def get_book_by_class_id(class_id: str, session: AsyncSession = Depends(get_session)):
    model = await book_service.get_book_by_class_id(class_id, session)
    if not model:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found.")
    return model

@book_router.put("/{book_id}", response_model=BookOut, status_code=status.HTTP_200_OK)
async def update_book(book_id: str, model: BookUpdate, session: AsyncSession = Depends(get_session)):
    updated = await book_service.update_book(book_id, model, session)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found.")
    return updated

@book_router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_book(book_id: str, session: AsyncSession = Depends(get_session)):
    deleted = await book_service.delete_book(book_id, session)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found.")
    return
