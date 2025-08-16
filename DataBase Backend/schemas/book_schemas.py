from pydantic import BaseModel, Field
from typing import Optional
import uuid
from .chapter_schemas import ChapterOut, ChapterOutbook
from .review_schemas import ReviewOut, ReviewOutBook
from .subject_schemas import SubjectOut

class BookBase(BaseModel):
    name: str
    medium: str
    subject_id: uuid.UUID
    class_id: uuid.UUID
    teacher: str
    duration: str
    cover_image: str
    description: str

class BookCreate(BookBase):
    pass

class BookUpdate(BaseModel):
    name: Optional[str] = None
    medium: Optional[str] = None
    subject_id: Optional[uuid.UUID] = None
    class_id: Optional[uuid.UUID] = None
    teacher: Optional[str] = None
    duration: Optional[str] = None
    cover_image: Optional[str] = None

class BookListOut(BookBase):
    uid: uuid.UUID
    subject: SubjectOut
    class Config:
        orm_mode = True

class BookOut(BookBase):
    uid: uuid.UUID
    subject: SubjectOut
    chapters: Optional[list[ChapterOutbook]] = []
    reviews: Optional[list[ReviewOutBook]] = []

    class Config:
        orm_mode = True
        
