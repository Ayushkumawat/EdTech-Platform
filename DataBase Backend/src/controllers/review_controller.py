from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from schemas.review_schemas import ReviewCreate, ReviewOut, ReviewUpdate
from db.database import get_session
from dal_files.review_dal import ReviewDAL

review_router = APIRouter()
review_service = ReviewDAL()

@review_router.post("/", response_model=ReviewOut, status_code=status.HTTP_201_CREATED)
async def create_review(model: ReviewCreate, session: AsyncSession = Depends(get_session)):
    created = await review_service.create_review(model, session)
    return created

@review_router.get("/{review_id}", response_model=ReviewOut, status_code=status.HTTP_200_OK)
async def get_review_by_id(review_id: str, session: AsyncSession = Depends(get_session)):
    model = await review_service.get_review_by_id(review_id, session)
    if not model:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found.")
    return model

@review_router.get("/", response_model=list[ReviewOut], status_code=status.HTTP_200_OK)
async def get_all_reviews(session: AsyncSession = Depends(get_session)):
    models = await review_service.get_all_reviews(session)
    return models

@review_router.put("/{review_id}", response_model=ReviewOut, status_code=status.HTTP_200_OK)
async def update_review(review_id: str, model: ReviewUpdate, session: AsyncSession = Depends(get_session)):
    updated = await review_service.update_review(review_id, model, session)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found.")
    return updated

@review_router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_review(review_id: str, session: AsyncSession = Depends(get_session)):
    deleted = await review_service.delete_review(review_id, session)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found.")
    return
