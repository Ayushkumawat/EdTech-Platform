from pydantic import BaseModel, Field
from typing import Optional
import uuid

class ChapterBase(BaseModel):
    title: str
    pages: list[str]
    book_id: uuid.UUID

class ChapterCreate(ChapterBase):
    pass

class ChapterUpdate(BaseModel):
    title: Optional[str] = None
    pages: Optional[list[str]] = None
    book_id: Optional[uuid.UUID] = None

class ChapterOut(ChapterBase):
    uid: uuid.UUID
    class Config:
        orm_mode = True

class ChapterOutbook(BaseModel):
    uid: uuid.UUID
    title: str 
    class Config:
        orm_mode = True