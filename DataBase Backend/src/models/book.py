from sqlalchemy import Column, String, Integer, TIMESTAMP, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship
from db.database import Base
import uuid
from datetime import datetime

class Book(Base):
    __tablename__ = 'book'

    uid = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    name = Column(String(255), nullable=False)
    medium = Column(String(255), nullable=False)
    subject_id = Column(PG_UUID(as_uuid=True), ForeignKey('subject.uid'), nullable=False)
    teacher = Column(String(255), nullable=False)
    duration = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    cover_image = Column(String(255), nullable=False)
    created_at = Column(TIMESTAMP, nullable=False, default=datetime.now)
    updated_at = Column(TIMESTAMP, nullable=False, default=datetime.now)
    class_id = Column(PG_UUID(as_uuid=True), ForeignKey('class.uid'), nullable=False)

    subject = relationship("Subject", back_populates="books", lazy="selectin")
    chapters = relationship("Chapter", back_populates="books", lazy="selectin")
    reviews = relationship("Review", back_populates="books", lazy="selectin")
    class_ = relationship("Class", back_populates="books", lazy="selectin")

    __table_args__ = ()
