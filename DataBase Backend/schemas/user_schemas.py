from pydantic import BaseModel, EmailStr, Field, field_serializer
from typing import Optional
from datetime import datetime
import uuid

class UserBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str
    class_id: Optional[uuid.UUID] = None
    google_id: Optional[str] = None

class UserCreate(UserBase):
    pass

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    class_id: Optional[uuid.UUID] = None
    daily_usage: Optional[int] = None
    subscription_id: Optional[uuid.UUID] = None

class UserOut(BaseModel):
    uid: uuid.UUID
    first_name: str
    last_name: str
    google_id: Optional[str] = None
    email: str
    class_id: uuid.UUID
    role_id: uuid.UUID
    subscription_id: uuid.UUID
    daily_usage: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
