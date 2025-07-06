from sqlalchemy import Column, String, Integer
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship
from db.database import Base
import uuid

class Subscription(Base):
    __tablename__ = 'subscription'

    uid = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    plan_name = Column(String(255), nullable=False)
    plan_description = Column(String(255), nullable=True)
    hours_per_day = Column(Integer, nullable=False)
    daily_limit = Column(Integer, nullable=False)
    duration = Column(String(255), nullable=False)
    cost = Column(Integer, nullable=False)
    discount = Column(Integer, nullable=False)
    
    transactions = relationship("Transaction", back_populates="subscription", lazy="selectin")
    users = relationship("User", back_populates="subscription")

    __table_args__ = ()
