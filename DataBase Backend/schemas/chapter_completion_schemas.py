from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid

class ChapterCompletionBase(BaseModel):
    user_id: uuid.UUID
    chapter_id: uuid.UUID
    current_page: int

class ChapterCompletionCreate(BaseModel):
    user_id: uuid.UUID
    chapter_id: uuid.UUID

class ChapterCompletionUpdate(BaseModel):
    user_id: Optional[uuid.UUID] = None
    chapter_id: Optional[uuid.UUID] = None
    current_page: Optional[int] = None

class ChapterPageOut(BaseModel):
    uid: uuid.UUID
    current_page: int
    passed_at: Optional[datetime] = None
    best_quiz_score: Optional[int] = None
    quiz_attempts: int = 0

class ChapterCompletionOut(ChapterCompletionBase):
    uid: uuid.UUID
    class Config:
        orm_mode = True