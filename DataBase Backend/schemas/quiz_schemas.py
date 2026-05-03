from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid


class QuestionPublic(BaseModel):
    uid: uuid.UUID
    text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str


class AttemptSummary(BaseModel):
    attempt_id: uuid.UUID
    score: int
    is_passed: bool
    submitted_at: datetime


class QuizSummaryOut(BaseModel):
    pass_percentage: int
    questions_per_attempt: int
    pool_size: int
    best_score: Optional[int] = None
    is_passed: bool
    attempts_count: int
    last_attempt: Optional[AttemptSummary] = None


class AttemptStartOut(BaseModel):
    attempt_id: uuid.UUID
    questions: List[QuestionPublic]


class AnswerIn(BaseModel):
    question_id: uuid.UUID
    selected_option: str = Field(..., pattern=r'^[abcd]$')


class AttemptSubmitIn(BaseModel):
    answers: List[AnswerIn]


class AttemptResultOut(BaseModel):
    score: int
    total: int
    is_passed: bool
    pass_percentage: int


class AttemptHistoryOut(BaseModel):
    attempts: List[AttemptSummary]
