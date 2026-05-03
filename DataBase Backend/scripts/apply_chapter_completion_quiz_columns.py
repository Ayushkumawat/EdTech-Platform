"""
Add quiz-related columns to chapter_completion if they are missing.

Safe to run multiple times (uses IF NOT EXISTS).

Usage:
    python scripts/apply_chapter_completion_quiz_columns.py
"""
import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

from config import settings

SQLALCHEMY_DATABASE_URL = (
    f"postgresql+asyncpg://{settings.database_username}:{settings.database_password}"
    f"@{settings.database_hostname}:{settings.database_port}/{settings.database_name}"
)

DDL_STATEMENTS = [
    "ALTER TABLE chapter_completion ADD COLUMN IF NOT EXISTS passed_at TIMESTAMP NULL",
    "ALTER TABLE chapter_completion ADD COLUMN IF NOT EXISTS best_quiz_score INTEGER NULL",
    "ALTER TABLE chapter_completion ADD COLUMN IF NOT EXISTS quiz_attempts INTEGER NOT NULL DEFAULT 0",
]


async def main() -> None:
    engine = create_async_engine(SQLALCHEMY_DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        for stmt in DDL_STATEMENTS:
            await conn.execute(text(stmt))
    await engine.dispose()
    print("chapter_completion columns applied (passed_at, best_quiz_score, quiz_attempts).")


if __name__ == "__main__":
    asyncio.run(main())
