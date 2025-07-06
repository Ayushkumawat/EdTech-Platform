from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from uuid import UUID
from models.chapter import Chapter
from schemas.chapter_schemas import ChapterCreate, ChapterUpdate

class ChapterDAL:
    async def chapter_exists(self, chapter_id: str, db_session: AsyncSession) -> bool:
        result = await db_session.execute(select(Chapter).where(Chapter.uid == chapter_id))
        return result.scalar_one_or_none() is not None

    async def get_all_chapters(self, db_session: AsyncSession) -> list[Chapter]:
        result = await db_session.execute(select(Chapter))
        return result.scalars().all()

    async def create_chapter(self, chapter_data: ChapterCreate, db_session: AsyncSession) -> Chapter:
        new_chapter = Chapter(**chapter_data.model_dump())
        db_session.add(new_chapter)
        await db_session.commit()
        await db_session.refresh(new_chapter)
        return new_chapter

    async def get_chapter_by_id(self, chapter_id: str, db_session: AsyncSession) -> Chapter:
        result = await db_session.execute(select(Chapter).where(Chapter.uid == chapter_id))
        return result.scalar_one_or_none()

    async def update_chapter(self, chapter_id: str, chapter_data: ChapterUpdate, db_session: AsyncSession) -> Chapter:
        chapter = await self.get_chapter_by_id(chapter_id, db_session)
        if not chapter:
            return None
        for key, value in chapter_data.model_dump(exclude_unset=True).items():
            setattr(chapter, key, value)
        await db_session.commit()
        await db_session.refresh(chapter)
        return chapter

    async def delete_chapter(self, chapter_id: str, db_session: AsyncSession) -> bool:
        chapter = await self.get_chapter_by_id(chapter_id, db_session)
        if not chapter:
            return False
        await db_session.delete(chapter)
        await db_session.commit()
        return True
