from pydantic import BaseModel, Field
from typing import Optional
import uuid
from datetime import datetime

class TransactionBase(BaseModel):
    subscription_id: uuid.UUID
    discount: int
    cost: int

class TransactionCreate(TransactionBase):
    pass

class TransactionOut(TransactionBase):
    uid: uuid.UUID
    user_id: uuid.UUID
    transaction_date: datetime
    class Config:
        orm_mode = True
