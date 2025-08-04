from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from uuid import UUID
from models.subscription import Subscription
from schemas.subscription_schemas import SubscriptionCreate, SubscriptionUpdate

class SubscriptionDAL:
    async def subscription_exists(self, subscription_id: str, db_session: AsyncSession) -> bool:
        result = await db_session.execute(select(Subscription).where(Subscription.uid == subscription_id))
        return result.scalar_one_or_none() is not None

    async def get_all_subscriptions(self, db_session: AsyncSession) -> list[Subscription]:
        result = await db_session.execute(select(Subscription))
        return result.scalars().all()

    async def create_subscription(self, subscription_data: SubscriptionCreate, db_session: AsyncSession) -> Subscription:
        new_subscription = Subscription(**subscription_data.model_dump())
        db_session.add(new_subscription)
        await db_session.commit()
        await db_session.refresh(new_subscription)
        return new_subscription

    async def get_subscription_by_id(self, subscription_id: str, db_session: AsyncSession) -> Subscription:
        result = await db_session.execute(select(Subscription).where(Subscription.uid == subscription_id))
        return result.scalar_one_or_none()
    
    async def get_subscription_by_name(self, subscription_name: str, db_session: AsyncSession) -> Subscription:
        result = await db_session.execute(select(Subscription).where(Subscription.plan_name == subscription_name))
        return result.scalar_one_or_none()

    async def update_subscription(self, subscription_id: str, subscription_data: SubscriptionUpdate, db_session: AsyncSession) -> Subscription:
        subscription = await self.get_subscription_by_id(subscription_id, db_session)
        if not subscription:
            return None
        for key, value in subscription_data.model_dump(exclude_unset=True).items():
            setattr(subscription, key, value)
        await db_session.commit()
        await db_session.refresh(subscription)
        return subscription

    async def delete_subscription(self, subscription_id: str, db_session: AsyncSession) -> bool:
        subscription = await self.get_subscription_by_id(subscription_id, db_session)
        if not subscription:
            return False
        await db_session.delete(subscription)
        await db_session.commit()
        return True
