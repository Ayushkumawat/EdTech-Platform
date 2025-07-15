from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from models.chapter_completion import ChapterCompletion
from schemas.chapter_completion_schemas import ChapterCompletionCreate, ChapterCompletionUpdate

class ChapterCompletionDAL:
    async def chapter_completion_exists(self, chapter_completion_id: UUID, db_session: AsyncSession) -> bool:
        result = await db_session.execute(select(ChapterCompletion).where(ChapterCompletion.uid == chapter_completion_id))
        return result.scalar_one_or_none() is not None

    async def get_chapter_completion_by_id(self, chapter_completion_id: UUID, db_session: AsyncSession) -> ChapterCompletion:
        result = await db_session.execute(select(ChapterCompletion).where(ChapterCompletion.uid == chapter_completion_id))
        return result.scalar_one_or_none()

    async def get_all_chapter_completions(self, db_session: AsyncSession) -> list[ChapterCompletion]:
        result = await db_session.execute(select(ChapterCompletion))
        return result.scalars().all()
    
    async def get_current_page(self, chapter_id, user_id, db_session: AsyncSession) -> ChapterCompletion:
        result = await db_session.execute(select(ChapterCompletion).where(ChapterCompletion.user_id == user_id, ChapterCompletion.chapter_id == chapter_id))
        chapter_completion = result.scalar_one_or_none()
        
        if chapter_completion:
            return chapter_completion
        else:
            new_page = ChapterCompletion(user_id=user_id, chapter_id=chapter_id, current_page=1)
            db_session.add(new_page)
            await db_session.commit()
            await db_session.refresh(new_page)
            return new_page
        
    async def update_chapter_completion(self, chapter_completion_id: UUID, chapter_completion_data: ChapterCompletionUpdate, db_session: AsyncSession) -> ChapterCompletion:
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
