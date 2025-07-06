from pydantic import BaseModel, Field
from typing import Optional
import uuid
from datetime import datetime

class ReviewBase(BaseModel):
    user_id: uuid.UUID
    book_id: uuid.UUID
    review_text: str
    rating: int

class ReviewCreate(ReviewBase):
    pass

class ReviewUpdate(BaseModel):
    user_id: Optional[uuid.UUID] = None
    book_id: Optional[uuid.UUID] = None
    review_text: Optional[str] = None
    rating: Optional[int] = None

class ReviewOut(ReviewBase):
    uid: uuid.UUID
    created_at: datetime
    class Config:
        orm_mode = True

class ReviewOutBook(BaseModel):
    uid: uuid.UUID
    user_id : uuid.UUID
    review_text: str
    rating: int
    created_at: datetime