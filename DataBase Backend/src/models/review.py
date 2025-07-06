from sqlalchemy import Column, String, Text, TIMESTAMP, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship
from db.database import Base
import uuid
from datetime import datetime

class Review(Base):
    __tablename__ = 'review'

    uid = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    user_id = Column(PG_UUID(as_uuid=True), ForeignKey('user.uid'), nullable=False)
    book_id = Column(PG_UUID(as_uuid=True), ForeignKey('book.uid'), nullable=False)
    review_text = Column(Text, nullable=False)
    rating = Column(Integer, nullable=False)
    created_at = Column(TIMESTAMP, nullable=False, default=datetime.now)

    users = relationship("User", back_populates="reviews", lazy="selectin")
    books = relationship("Book", back_populates="reviews", lazy="selectin")

    __table_args__ = ()
