from pydantic import BaseModel, Field
from typing import Optional
import uuid

class ChapterCompletionBase(BaseModel):
    user_id: uuid.UUID
    chapter_id: uuid.UUID
    current_page: int
    total_pages: int

class ChapterCompletionCreate(ChapterCompletionBase):
    pass

class ChapterCompletionUpdate(BaseModel):
    user_id: Optional[uuid.UUID] = None
    chapter_id: Optional[uuid.UUID] = None
    current_page: Optional[int] = None
    total_pages: Optional[int] = None

class ChapterCompletionOut(ChapterCompletionBase):
    uid: uuid.UUID
    class Config:
        orm_mode = True
