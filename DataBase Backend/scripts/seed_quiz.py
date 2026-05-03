"""
Seed quiz questions from a JSON file into the database.

Usage:
    python scripts/seed_quiz.py <chapter_id> path/to/questions.json

Arguments:
    chapter_id      UUID of the chapter these questions belong to
    questions.json  Path to the JSON file containing question objects

Expected JSON format (chapter_id NOT needed inside the file):
[
  {
    "text": "What is the powerhouse of the cell?",
    "option_a": "Nucleus",
    "option_b": "Mitochondria",
    "option_c": "Ribosome",
    "option_d": "Golgi apparatus",
    "correct_option": "b",
    "explanation": "Mitochondria produce ATP via cellular respiration."
  }
]
"""

import asyncio
import json
import sys
import os
from uuid import UUID
from typing import Optional

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from pydantic import BaseModel, Field
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from config import settings
from models.quiz import QuizQuestion


SQLALCHEMY_DATABASE_URL = (
    f"postgresql+asyncpg://{settings.database_username}:{settings.database_password}"
    f"@{settings.database_hostname}:{settings.database_port}/{settings.database_name}"
)


class QuizQuestionSeed(BaseModel):
    text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_option: str = Field(..., pattern=r'^[abcd]$')
    explanation: Optional[str] = None


async def seed(chapter_id: UUID, json_path: str) -> None:
    with open(json_path, 'r', encoding='utf-8') as f:
        raw = json.load(f)

    if not isinstance(raw, list):
        print("ERROR: JSON file must contain a list of question objects.")
        sys.exit(1)

    valid_entries: list[QuizQuestionSeed] = []
    for i, item in enumerate(raw):
        try:
            valid_entries.append(QuizQuestionSeed(**item))
        except Exception as e:
            print(f"  SKIP row {i}: {e}")

    print(f"Validated {len(valid_entries)} / {len(raw)} questions for chapter {chapter_id}.")

    if not valid_entries:
        print("Nothing to insert.")
        return

    engine = create_async_engine(SQLALCHEMY_DATABASE_URL, echo=False)
    async_session = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

    inserted = 0
    skipped = 0

    async with async_session() as session:
        for entry in valid_entries:
            try:
                question = QuizQuestion(
                    chapter_id=chapter_id,
                    text=entry.text,
                    option_a=entry.option_a,
                    option_b=entry.option_b,
                    option_c=entry.option_c,
                    option_d=entry.option_d,
                    correct_option=entry.correct_option,
                    explanation=entry.explanation,
                )
                session.add(question)
                await session.commit()
                inserted += 1
            except IntegrityError:
                await session.rollback()
                skipped += 1
                print(f"  SKIP (duplicate): text={entry.text[:60]!r}")
            except Exception as e:
                await session.rollback()
                skipped += 1
                print(f"  ERROR: {e}")

    await engine.dispose()
    print(f"\nInserted {inserted} / {len(valid_entries)} questions ({skipped} skipped/errored).")


if __name__ == '__main__':
    if len(sys.argv) != 3:
        print("Usage: python scripts/seed_quiz.py <chapter_id> path/to/questions.json")
        print("  chapter_id  UUID of the chapter (e.g. 3f2504e0-4f89-11d3-9a0c-0305e82c3301)")
        sys.exit(1)

    try:
        chapter_uuid = UUID(sys.argv[1])
    except ValueError:
        print(f"ERROR: '{sys.argv[1]}' is not a valid UUID.")
        sys.exit(1)

    json_path = sys.argv[2]
    if not os.path.isfile(json_path):
        print(f"ERROR: File not found: {json_path}")
        sys.exit(1)

    asyncio.run(seed(chapter_uuid, json_path))
