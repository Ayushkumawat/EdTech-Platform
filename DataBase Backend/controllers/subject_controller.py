from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from schemas.subject_schemas import SubjectCreate, SubjectOut, SubjectUpdate
from db.database import get_session
from dal_files.subject_dal import SubjectDAL
from typing import List

subject_router = APIRouter()
subject_service = SubjectDAL()

@subject_router.post("/", response_model=SubjectOut, status_code=status.HTTP_201_CREATED)
async def create_subject(model: SubjectCreate, session: AsyncSession = Depends(get_session)):
    created = await subject_service.create_subject(model, session)
    return created

@subject_router.get("/{class_id}", response_model=List[SubjectOut], status_code=status.HTTP_200_OK)
async def get_subject_by_class_id(class_id: str, session: AsyncSession = Depends(get_session)):
    model = await subject_service.get_subject_by_class_id(class_id, session)
    if not model:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found.")
    return model

@subject_router.get("/", response_model=list[SubjectOut], status_code=status.HTTP_200_OK)
async def get_all_subjects(session: AsyncSession = Depends(get_session)):
    models = await subject_service.get_all_subjects(session)
    return models

@subject_router.put("/{subject_id}", response_model=SubjectOut, status_code=status.HTTP_200_OK)
async def update_subject(subject_id: str, model: SubjectUpdate, session: AsyncSession = Depends(get_session)):
    updated = await subject_service.update_subject(subject_id, model, session)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found.")
    return updated

@subject_router.delete("/{subject_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_subject(subject_id: str, session: AsyncSession = Depends(get_session)):
    deleted = await subject_service.delete_subject(subject_id, session)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found.")
    return
