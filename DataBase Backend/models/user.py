from sqlalchemy import Column, String, BigInteger, JSON, TIMESTAMP, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship
from db.database import Base
import uuid
from datetime import datetime

class User(Base):
    __tablename__ = 'user'

    uid = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    first_name = Column(String(255), nullable=False)
    last_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, unique=True)
    password_hash = Column(String(255), nullable=False)
    class_id = Column(PG_UUID(as_uuid=True), ForeignKey('class.uid'), nullable=False)
    role_id = Column(PG_UUID(as_uuid=True), ForeignKey('role.uid'), nullable=False)
    subscription_id = Column(PG_UUID(as_uuid=True), ForeignKey('subscription.uid'), nullable=False)
    google_id = Column(String(255), nullable=True, unique=True)
    daily_usage = Column(Integer, nullable=False, default=0)
    created_at = Column(TIMESTAMP, nullable=False, default=datetime.now)
    updated_at = Column(TIMESTAMP, nullable=False, default=datetime.now)

    transactions = relationship("Transaction", back_populates="user", lazy="selectin")
    reviews = relationship("Review", back_populates="users", lazy="selectin")
    chapter_completions = relationship("ChapterCompletion", back_populates="user", lazy="selectin")
    role = relationship("Role", back_populates="users")
    class_ = relationship("Class", back_populates="users")
    subscription = relationship("Subscription", back_populates="users", lazy="selectin")
    __table_args__ = ()
