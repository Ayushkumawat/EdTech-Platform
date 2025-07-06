from pydantic import BaseModel, Field
from typing import Optional, List
from .book_schemas import BookOut
from .subject_schemas import SubjectOut
import uuid


class ClassBase(BaseModel):
    name: str
    description: Optional[str] = None
    board: str

class ClassCreate(ClassBase):
    pass

class ClassUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    board: Optional[str] = None

class ClassOut(BaseModel):
    books: List[BookOut]
    subjects: List[SubjectOut]
    class Config:
        orm_mode = True

class ClassOutSignup(BaseModel):
    uid: uuid.UUID
    name: str
    class Config:
        orm_mode = True