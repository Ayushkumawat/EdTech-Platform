import random
from datetime import datetime
from uuid import UUID

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from config import QUIZ_QUESTIONS_PER_ATTEMPT, QUIZ_PASS_PERCENTAGE
from models.chapter_completion import ChapterCompletion
from models.quiz import QuizAttempt, QuizAttemptQuestion, QuizQuestion
from schemas.quiz_schemas import (
    AnswerIn,
    AttemptHistoryOut,
    AttemptResultOut,
    AttemptStartOut,
    AttemptSummary,
    QuestionPublic,
    QuizSummaryOut,
)


class QuizDAL:

    async def get_quiz_summary(
        self, chapter_id: UUID, user_id: UUID, db_session: AsyncSession
    ) -> QuizSummaryOut:
        pool_count_result = await db_session.execute(
            select(func.count()).where(QuizQuestion.chapter_id == chapter_id)
        )
        pool_size = pool_count_result.scalar_one()

        cc_result = await db_session.execute(
            select(ChapterCompletion).where(
                ChapterCompletion.chapter_id == chapter_id,
                ChapterCompletion.user_id == user_id,
            )
        )
        cc = cc_result.scalar_one_or_none()

        last_attempt_obj = None
        if cc and cc.quiz_attempts > 0:
            la_result = await db_session.execute(
                select(QuizAttempt)
                .where(
                    QuizAttempt.chapter_id == chapter_id,
                    QuizAttempt.user_id == user_id,
                    QuizAttempt.submitted_at.isnot(None),
                )
                .order_by(QuizAttempt.submitted_at.desc())
                .limit(1)
            )
            la = la_result.scalar_one_or_none()
            if la:
                last_attempt_obj = AttemptSummary(
                    attempt_id=la.uid,
                    score=la.score,
                    is_passed=la.is_passed,
                    submitted_at=la.submitted_at,
                )

        return QuizSummaryOut(
            pass_percentage=QUIZ_PASS_PERCENTAGE,
            questions_per_attempt=QUIZ_QUESTIONS_PER_ATTEMPT,
            pool_size=pool_size,
            best_score=cc.best_quiz_score if cc else None,
            is_passed=bool(cc and cc.passed_at is not None),
            attempts_count=cc.quiz_attempts if cc else 0,
            last_attempt=last_attempt_obj,
        )

    async def start_attempt(
        self, chapter_id: UUID, user_id: UUID, db_session: AsyncSession
    ) -> AttemptStartOut:
        questions_result = await db_session.execute(
            select(QuizQuestion).where(QuizQuestion.chapter_id == chapter_id)
        )
        all_questions = questions_result.scalars().all()

        if not all_questions:
            return None

        sample_size = min(QUIZ_QUESTIONS_PER_ATTEMPT, len(all_questions))
        sampled = random.sample(all_questions, sample_size)

        attempt = QuizAttempt(
            chapter_id=chapter_id,
            user_id=user_id,
        )
        db_session.add(attempt)
        await db_session.flush()

        for position, question in enumerate(sampled, start=1):
            aq = QuizAttemptQuestion(
                attempt_id=attempt.uid,
                question_id=question.uid,
                position=position,
            )
            db_session.add(aq)

        await db_session.commit()
        await db_session.refresh(attempt)

        question_list = [
            QuestionPublic(
                uid=q.uid,
                text=q.text,
                option_a=q.option_a,
                option_b=q.option_b,
                option_c=q.option_c,
                option_d=q.option_d,
            )
            for q in sampled
        ]

        return AttemptStartOut(attempt_id=attempt.uid, questions=question_list)

    async def submit_attempt(
        self,
        attempt_id: UUID,
        answers: list[AnswerIn],
        user_id: UUID,
        db_session: AsyncSession,
    ) -> AttemptResultOut:
        attempt_result = await db_session.execute(
            select(QuizAttempt).where(QuizAttempt.uid == attempt_id)
        )
        attempt = attempt_result.scalar_one_or_none()

        if attempt is None:
            return None

        if attempt.user_id != user_id:
            raise PermissionError("Attempt does not belong to current user.")

        if attempt.submitted_at is not None:
            raise ValueError("Attempt already submitted.")

        served_map = {aq.question_id: aq for aq in attempt.attempt_questions}

        answer_map = {a.question_id: a.selected_option for a in answers}

        for question_id in answer_map:
            if question_id not in served_map:
                raise KeyError(f"question_id {question_id} was not served in this attempt.")

        correct_count = 0
        total = len(served_map)

        for question_id, aq in served_map.items():
            selected = answer_map.get(question_id)
            is_correct = selected is not None and selected == aq.question.correct_option
            aq.selected_option = selected
            aq.is_correct = is_correct
            if is_correct:
                correct_count += 1

        score = correct_count * 100 // total
        is_passed = score >= QUIZ_PASS_PERCENTAGE

        attempt.score = score
        attempt.is_passed = is_passed
        attempt.submitted_at = datetime.now()

        cc_result = await db_session.execute(
            select(ChapterCompletion).where(
                ChapterCompletion.chapter_id == attempt.chapter_id,
                ChapterCompletion.user_id == user_id,
            )
        )
        cc = cc_result.scalar_one_or_none()

        if cc is None:
            cc = ChapterCompletion(
                chapter_id=attempt.chapter_id,
                user_id=user_id,
                current_page=0,
                quiz_attempts=0,
            )
            db_session.add(cc)
            await db_session.flush()

        cc.quiz_attempts = (cc.quiz_attempts or 0) + 1
        cc.best_quiz_score = (
            score
            if cc.best_quiz_score is None
            else max(cc.best_quiz_score, score)
        )
        if is_passed and cc.passed_at is None:
            cc.passed_at = datetime.now()

        await db_session.commit()

        return AttemptResultOut(
            score=score,
            total=total,
            is_passed=is_passed,
            pass_percentage=QUIZ_PASS_PERCENTAGE,
        )

    async def list_user_attempts(
        self, chapter_id: UUID, user_id: UUID, db_session: AsyncSession
    ) -> AttemptHistoryOut:
        result = await db_session.execute(
            select(QuizAttempt)
            .where(
                QuizAttempt.chapter_id == chapter_id,
                QuizAttempt.user_id == user_id,
                QuizAttempt.submitted_at.isnot(None),
            )
            .order_by(QuizAttempt.submitted_at.desc())
        )
        attempts = result.scalars().all()

        return AttemptHistoryOut(
            attempts=[
                AttemptSummary(
                    attempt_id=a.uid,
                    score=a.score,
                    is_passed=a.is_passed,
                    submitted_at=a.submitted_at,
                )
                for a in attempts
            ]
        )
