"""
Verify quiz data in PostgreSQL (no HTTP).

Usage:
    python scripts/verify_quiz_db.py
    python scripts/verify_quiz_db.py 84ff48ce-5bd9-4ced-8ae0-852367061b36 bf5f88c0-a7e1-4345-aaaa-973d9e65829c
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from config import settings
from models.quiz import QuizAttempt, QuizAttemptQuestion, QuizQuestion

SQLALCHEMY_DATABASE_URL = (
    f"postgresql+asyncpg://{settings.database_username}:{settings.database_password}"
    f"@{settings.database_hostname}:{settings.database_port}/{settings.database_name}"
)


async def main(chapter_ids: list[str]) -> None:
    import models.quiz  # noqa: F401

    engine = create_async_engine(SQLALCHEMY_DATABASE_URL, echo=False)
    async_session = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        total_q = await session.execute(select(func.count()).select_from(QuizQuestion))
        print(f"quiz_question total rows: {total_q.scalar_one()}")

        for cid in chapter_ids:
            r = await session.execute(
                select(func.count()).where(QuizQuestion.chapter_id == cid)
            )
            n = r.scalar_one()
            print(f"  chapter_id={cid}  ->  {n} question(s)")

            if n > 0:
                sample = await session.execute(
                    select(QuizQuestion.text, QuizQuestion.option_a).where(
                        QuizQuestion.chapter_id == cid
                    ).limit(1)
                )
                row = sample.first()
                if row:
                    text_preview = (row[0][:80] + "...") if len(row[0]) > 80 else row[0]
                    print(f"    sample text: {text_preview!r}")
                    print(f"    sample option_a: {row[1]!r}")

        ta = await session.execute(select(func.count()).select_from(QuizAttempt))
        tq = await session.execute(select(func.count()).select_from(QuizAttemptQuestion))
        print(f"quiz_attempt total rows: {ta.scalar_one()}")
        print(f"quiz_attempt_question total rows: {tq.scalar_one()}")

    await engine.dispose()
    print("\nDB read OK — quiz tables are reachable and counts are above.")


if __name__ == "__main__":
    default_chapters = [
        "84ff48ce-5bd9-4ced-8ae0-852367061b36",
        "bf5f88c0-a7e1-4345-aaaa-973d9e65829c",
    ]
    chapters = sys.argv[1:] if len(sys.argv) > 1 else default_chapters
    asyncio.run(main(chapters))
