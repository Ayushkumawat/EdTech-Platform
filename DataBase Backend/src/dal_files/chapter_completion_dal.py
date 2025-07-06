from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from uuid import UUID
from models.chapter_completion import ChapterCompletion
from schemas.chapter_completion_schemas import ChapterCompletionCreate, ChapterCompletionUpdate

class ChapterCompletionDAL:
    async def chapter_completion_exists(self, chapter_completion_id: str, db_session: AsyncSession) -> bool:
        result = await db_session.execute(select(ChapterCompletion).where(ChapterCompletion.uid == chapter_completion_id))
        return result.scalar_one_or_none() is not None

    async def get_all_chapter_completions(self, db_session: AsyncSession) -> list[ChapterCompletion]:
        result = await db_session.execute(select(ChapterCompletion))
        return result.scalars().all()

    async def create_chapter_completion(self, chapter_completion_data: ChapterCompletionCreate, db_session: AsyncSession) -> ChapterCompletion:
        new_chapter_completion = ChapterCompletion(**chapter_completion_data.model_dump())
        db_session.add(new_chapter_completion)
        await db_session.commit()
        await db_session.refresh(new_chapter_completion)
        return new_chapter_completion

    async def get_chapter_completion_by_id(self, chapter_completion_id: str, db_session: AsyncSession) -> ChapterCompletion:
        result = await db_session.execute(select(ChapterCompletion).where(ChapterCompletion.uid == chapter_completion_id))
        return result.scalar_one_or_none()

    async def update_chapter_completion(self, chapter_completion_id: str, chapter_completion_data: ChapterCompletionUpdate, db_session: AsyncSession) -> ChapterCompletion:
        chapter_completion = await self.get_chapter_completion_by_id(chapter_completion_id, db_session)
        if not chapter_completion:
            return None
        for key, value in chapter_completion_data.model_dump(exclude_unset=True).items():
            setattr(chapter_completion, key, value)
        await db_session.commit()
        await db_session.refresh(chapter_completion)
        return chapter_completion

    async def delete_chapter_completion(self, chapter_completion_id: str, db_session: AsyncSession) -> bool:
        chapter_completion = await self.get_chapter_completion_by_id(chapter_completion_id, db_session)
        if not chapter_completion:
            return False
        await db_session.delete(chapter_completion)
        await db_session.commit()
        return True
