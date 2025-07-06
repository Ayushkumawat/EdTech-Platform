from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from uuid import UUID
from models.class_model import Class
from schemas.class_schemas import ClassCreate, ClassUpdate

class ClassDAL:
    async def class_exists(self, class_id: str, db_session: AsyncSession) -> bool:
        result = await db_session.execute(select(Class).where(Class.uid == class_id))
        return result.scalar_one_or_none() is not None

    async def get_all_classes(self, db_session: AsyncSession) -> list[Class]:
        result = await db_session.execute(select(Class))
        return result.scalars().all()

    async def create_class(self, class_data: ClassCreate, db_session: AsyncSession) -> Class:
        new_class = Class(**class_data.model_dump())
        db_session.add(new_class)
        await db_session.commit()
        await db_session.refresh(new_class)
        return new_class

    async def get_class_by_id(self, class_id: str, db_session: AsyncSession) -> Class:
        result = await db_session.execute(select(Class).where(Class.uid == class_id))
        return result.scalar_one_or_none()

    async def update_class(self, class_id: str, class_data: ClassUpdate, db_session: AsyncSession) -> Class:
        class_ = await self.get_class_by_id(class_id, db_session)
        if not class_:
            return None
        for key, value in class_data.model_dump(exclude_unset=True).items():
            setattr(class_, key, value)
        await db_session.commit()
        await db_session.refresh(class_)
        return class_

    async def delete_class(self, class_id: str, db_session: AsyncSession) -> bool:
        class_ = await self.get_class_by_id(class_id, db_session)
        if not class_:
            return False
        await db_session.delete(class_)
        await db_session.commit()
        return True
