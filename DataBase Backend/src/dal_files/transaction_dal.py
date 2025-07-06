from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from uuid import UUID
from models.transaction import Transaction
from schemas.transaction_schemas import TransactionCreate

class TransactionDAL:
    async def transaction_exists(self, transaction_id: str, db_session: AsyncSession) -> bool:
        result = await db_session.execute(select(Transaction).where(Transaction.uid == transaction_id))
        return result.scalar_one_or_none() is not None

    async def get_all_transactions(self, db_session: AsyncSession) -> list[Transaction]:
        result = await db_session.execute(select(Transaction))
        return result.scalars().all()

    async def create_transaction(self, transaction_data: TransactionCreate, user_id, db_session: AsyncSession) -> Transaction:
        new_transaction = Transaction(**transaction_data.model_dump(), user_id=user_id)
        db_session.add(new_transaction)
        await db_session.commit()
        await db_session.refresh(new_transaction)
        return new_transaction

    async def get_transaction_by_id(self, transaction_id: str, db_session: AsyncSession) -> Transaction:
        result = await db_session.execute(select(Transaction).where(Transaction.uid == transaction_id))
        return result.scalar_one_or_none()