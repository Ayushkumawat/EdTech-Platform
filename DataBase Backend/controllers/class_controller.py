from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from schemas.class_schemas import ClassCreate, ClassOut, ClassUpdate, ClassOutSignup
from db.database import get_session
from dal_files.class_dal import ClassDAL

class_router = APIRouter()
class_service = ClassDAL()

@class_router.post("/", response_model=ClassOut, status_code=status.HTTP_201_CREATED)
async def create_class(model: ClassCreate, session: AsyncSession = Depends(get_session)):
    created = await class_service.create_class(model, session)
    return created

@class_router.get("/{class_id}", response_model=ClassOut, status_code=status.HTTP_200_OK)
async def get_class_by_id(class_id: str, session: AsyncSession = Depends(get_session)):
    model = await class_service.get_class_by_id(class_id, session)
    if not model:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Class not found.")
    return model

@class_router.get("/", response_model=list[ClassOutSignup], status_code=status.HTTP_200_OK)
async def get_all_classes(session: AsyncSession = Depends(get_session)):
    models = await class_service.get_all_classes(session)
    return models

@class_router.put("/{class_id}", response_model=ClassOut, status_code=status.HTTP_200_OK)
async def update_class(class_id: str, model: ClassUpdate, session: AsyncSession = Depends(get_session)):
    updated = await class_service.update_class(class_id, model, session)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Class not found.")
    return updated

@class_router.delete("/{class_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_class(class_id: str, session: AsyncSession = Depends(get_session)):
    deleted = await class_service.delete_class(class_id, session)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Class not found.")
    return
