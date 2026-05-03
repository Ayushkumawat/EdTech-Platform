import os

from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from typing import AsyncGenerator
from config import settings

Base = declarative_base()

# PostgreSQL Async URL using asyncpg
SQLALCHEMY_DATABASE_URL = (
    f"postgresql+asyncpg://{settings.database_username}:{settings.database_password}"
    f"@{settings.database_hostname}:{settings.database_port}/{settings.database_name}"
)

_sqlalchemy_echo = os.getenv("SQLALCHEMY_ECHO", "").lower() in ("1", "true", "yes")

# Create async engine (single instance — do not recreate per request)
async_engine: AsyncEngine = create_async_engine(
    SQLALCHEMY_DATABASE_URL,
    echo=_sqlalchemy_echo,
    pool_pre_ping=True,
)

# Session factory — create once, reuse for every request (was incorrectly built inside get_session)
async_session_factory = sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)

# Initialize the DB
async def init_db():
    print("⏳ Initializing DB...")
    from models.user import User
    from models.transaction import Transaction
    from models.subscription import Subscription
    from models.review import Review
    from models.book import Book
    from models.chapter import Chapter
    from models.chapter_completion import ChapterCompletion
    from models.class_model import Class
    from models.subject import Subject
    from models.quiz import QuizQuestion, QuizAttempt, QuizAttemptQuestion
    # ...import other models here if needed

    async with async_engine.begin() as conn:
        print("📥 Creating tables...")
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Database created successfully.")

# Dependency to get the DB session
async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_factory() as session:
        yield session

# CLI run support
if __name__ == "__main__":
    import asyncio
    asyncio.run(init_db())
