from pydantic import BaseModel, Field
from typing import Optional
import uuid

class SubjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    class_id: uuid.UUID

class SubjectCreate(SubjectBase):
    pass

class SubjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    class_id: Optional[uuid.UUID] = None

class SubjectOut(SubjectBase):
    uid: uuid.UUID
    class Config:
        orm_mode = True
