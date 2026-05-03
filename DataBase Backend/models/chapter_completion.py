from sqlalchemy import Column, TIMESTAMP, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship
from db.database import Base
import uuid
from datetime import datetime


class ChapterCompletion(Base):
    __tablename__ = 'chapter_completion'

    uid = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    user_id = Column(PG_UUID(as_uuid=True), ForeignKey('user.uid'), nullable=False)
    chapter_id = Column(PG_UUID(as_uuid=True), ForeignKey('chapter.uid'), nullable=False)
    current_page = Column(Integer, nullable=False)
    passed_at       = Column(TIMESTAMP, nullable=True)
    best_quiz_score = Column(Integer, nullable=True)
    quiz_attempts   = Column(Integer, nullable=False, default=0)

    user = relationship("User", back_populates="chapter_completions", lazy="selectin")
    chapter = relationship("Chapter", back_populates="chapter_completions", lazy="selectin")

    __table_args__ = ()
