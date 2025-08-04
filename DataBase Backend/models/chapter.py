from sqlalchemy import Column, String, Text, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID as PG_UUID, ARRAY as PG_ARRAY
from sqlalchemy.orm import relationship
from db.database import Base
import uuid

class Chapter(Base):
    __tablename__ = 'chapter'

    uid = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    title = Column(String(255), nullable=False)
    start_page = Column(Integer, nullable=False)
    pages = Column(PG_ARRAY(String), default=list)
    book_id = Column(PG_UUID(as_uuid=True), ForeignKey('book.uid'), nullable=False)

    books = relationship("Book", back_populates="chapters", lazy="selectin")
    chapter_completions = relationship("ChapterCompletion", back_populates="chapter", lazy="selectin")

    __table_args__ = ()
