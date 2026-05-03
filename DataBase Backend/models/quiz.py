from sqlalchemy import Column, String, Text, Integer, Boolean, TIMESTAMP, ForeignKey, UniqueConstraint, Index
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship
from db.database import Base
import uuid
from datetime import datetime


class QuizQuestion(Base):
    __tablename__ = 'quiz_question'

    uid            = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    chapter_id     = Column(PG_UUID(as_uuid=True), ForeignKey('chapter.uid'), nullable=False)
    text           = Column(Text, nullable=False)
    option_a       = Column(String(500), nullable=False)
    option_b       = Column(String(500), nullable=False)
    option_c       = Column(String(500), nullable=False)
    option_d       = Column(String(500), nullable=False)
    correct_option = Column(String(1), nullable=False)   # 'a' | 'b' | 'c' | 'd'
    explanation    = Column(Text, nullable=True)
    created_at     = Column(TIMESTAMP, nullable=False, default=datetime.now)

    chapter           = relationship("Chapter", back_populates="quiz_questions", lazy="selectin")
    attempt_questions = relationship("QuizAttemptQuestion", back_populates="question", lazy="selectin")

    __table_args__ = (
        Index('ix_quiz_question_chapter_id', 'chapter_id'),
    )


class QuizAttempt(Base):
    __tablename__ = 'quiz_attempt'

    uid          = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    chapter_id   = Column(PG_UUID(as_uuid=True), ForeignKey('chapter.uid'), nullable=False)
    user_id      = Column(PG_UUID(as_uuid=True), ForeignKey('user.uid'), nullable=False)
    started_at   = Column(TIMESTAMP, nullable=False, default=datetime.now)
    submitted_at = Column(TIMESTAMP, nullable=True)
    score        = Column(Integer, nullable=True)
    is_passed    = Column(Boolean, nullable=False, default=False)

    chapter           = relationship("Chapter", back_populates="quiz_attempts", lazy="selectin")
    user              = relationship("User", back_populates="quiz_attempts", lazy="selectin")
    attempt_questions = relationship("QuizAttemptQuestion", back_populates="attempt", lazy="selectin")

    __table_args__ = (
        Index('ix_quiz_attempt_user_chapter', 'user_id', 'chapter_id'),
    )


class QuizAttemptQuestion(Base):
    __tablename__ = 'quiz_attempt_question'

    uid             = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    attempt_id      = Column(PG_UUID(as_uuid=True), ForeignKey('quiz_attempt.uid'), nullable=False)
    question_id     = Column(PG_UUID(as_uuid=True), ForeignKey('quiz_question.uid'), nullable=False)
    position        = Column(Integer, nullable=False)
    selected_option = Column(String(1), nullable=True)   # 'a'–'d', NULL = skipped
    is_correct      = Column(Boolean, nullable=True)

    attempt  = relationship("QuizAttempt", back_populates="attempt_questions", lazy="selectin")
    question = relationship("QuizQuestion", back_populates="attempt_questions", lazy="selectin")

    __table_args__ = (
        UniqueConstraint('attempt_id', 'question_id', name='uq_attempt_question'),
        Index('ix_quiz_attempt_question_attempt_id', 'attempt_id'),
        Index('ix_quiz_attempt_question_question_attempt', 'question_id', 'attempt_id'),
    )
