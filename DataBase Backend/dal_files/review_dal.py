from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from uuid import UUID
from models.review import Review
from schemas.review_schemas import ReviewCreate, ReviewUpdate

class ReviewDAL:
    async def review_exists(self, review_id: str, db_session: AsyncSession) -> bool:
        result = await db_session.execute(select(Review).where(Review.uid == review_id))
        return result.scalar_one_or_none() is not None

    async def get_all_reviews(self, db_session: AsyncSession) -> list[Review]:
        result = await db_session.execute(select(Review))
        return result.scalars().all()

    async def create_review(self, review_data: ReviewCreate, db_session: AsyncSession) -> Review:
        new_review = Review(**review_data.model_dump())
        db_session.add(new_review)
        await db_session.commit()
        await db_session.refresh(new_review)
        return new_review

    async def get_review_by_id(self, review_id: str, db_session: AsyncSession) -> Review:
        result = await db_session.execute(select(Review).where(Review.uid == review_id))
        return result.scalar_one_or_none()

    async def update_review(self, review_id: str, review_data: ReviewUpdate, db_session: AsyncSession) -> Review:
        review = await self.get_review_by_id(review_id, db_session)
        if not review:
            return None
        for key, value in review_data.model_dump(exclude_unset=True).items():
            setattr(review, key, value)
        await db_session.commit()
        await db_session.refresh(review)
        return review

    async def delete_review(self, review_id: str, db_session: AsyncSession) -> bool:
        review = await self.get_review_by_id(review_id, db_session)
        if not review:
            return False
        await db_session.delete(review)
        await db_session.commit()
        return True
