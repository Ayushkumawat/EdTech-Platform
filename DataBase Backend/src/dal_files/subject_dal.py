from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from uuid import UUID
from models.subject import Subject
from schemas.subject_schemas import SubjectCreate, SubjectUpdate

class SubjectDAL:
    async def subject_exists(self, subject_id: str, db_session: AsyncSession) -> bool:
        result = await db_session.execute(select(Subject).where(Subject.uid == subject_id))
        return result.scalar_one_or_none() is not None

    async def get_all_subjects(self, db_session: AsyncSession) -> list[Subject]:
        result = await db_session.execute(select(Subject))
        return result.scalars().all()

    async def create_subject(self, subject_data: SubjectCreate, db_session: AsyncSession) -> Subject:
        new_subject = Subject(**subject_data.model_dump())
        db_session.add(new_subject)
        await db_session.commit()
        await db_session.refresh(new_subject)
        return new_subject

    async def get_subject_by_class_id(self, class_id: str, db_session: AsyncSession) -> Subject:
        result = await db_session.execute(select(Subject).where(Subject.class_id == class_id))
        return result.scalars().all()

    async def update_subject(self, subject_id: str, subject_data: SubjectUpdate, db_session: AsyncSession) -> Subject:
        subject = await self.get_subject_by_id(subject_id, db_session)
        if not subject:
            return None
        for key, value in subject_data.model_dump(exclude_unset=True).items():
            setattr(subject, key, value)
        await db_session.commit()
        await db_session.refresh(subject)
        return subject

    async def delete_subject(self, subject_id: str, db_session: AsyncSession) -> bool:
        subject = await self.get_subject_by_id(subject_id, db_session)
        if not subject:
            return False
        await db_session.delete(subject)
        await db_session.commit()
        return True
