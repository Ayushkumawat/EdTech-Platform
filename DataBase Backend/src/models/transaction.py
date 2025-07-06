from sqlalchemy import Column, String, Integer, TIMESTAMP, ForeignKey
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship
from db.database import Base
import uuid
from datetime import datetime

class Transaction(Base):
    __tablename__ = 'transaction'

    uid = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    user_id = Column(PG_UUID(as_uuid=True), ForeignKey('user.uid'), nullable=False)
    subscription_id = Column(PG_UUID(as_uuid=True), ForeignKey('subscription.uid'), nullable=False)
    discount = Column(Integer, nullable=False)
    cost = Column(Integer, nullable=False)
    transaction_date = Column(TIMESTAMP, nullable=False, default=datetime.now)

    user = relationship("User", back_populates="transactions", lazy="selectin")
    subscription = relationship("Subscription", back_populates="transactions", lazy="selectin")

    __table_args__ = ()
