from pydantic import BaseModel, Field
from typing import Optional
import uuid
from enum import Enum

class SubscriptionEnum(str, Enum):
    plan_free = "Free"
    plan_basic = "Basic"
    plan_premium = "Premium"

class SubscriptionBase(BaseModel):
    plan_name: SubscriptionEnum
    plan_description: str
    hours_per_day: int
    daily_limit: int
    duration: str
    cost: int
    discount: int

class SubscriptionCreate(SubscriptionBase):
    pass

class SubscriptionUpdate(BaseModel):
    hours_per_day: Optional[int] = None
    daily_limit: Optional[int] = None
    duration: Optional[str] = None
    cost: Optional[int] = None
    discount: Optional[int] = None

class SubscriptionOut(SubscriptionBase):
    uid: uuid.UUID
    class Config:
        orm_mode = True
