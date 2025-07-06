from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from uuid import UUID
from models.book import Book
from schemas.book_schemas import BookCreate, BookUpdate

class BookDAL:
    async def book_exists(self, book_id: str, db_session: AsyncSession) -> bool:
        result = await db_session.execute(select(Book).where(Book.uid == book_id))
        return result.scalar_one_or_none() is not None

    async def get_all_books(self, db_session: AsyncSession) -> list[Book]:
        result = await db_session.execute(select(Book))
        return result.scalars().all()

    async def create_book(self, book_data: BookCreate, db_session: AsyncSession) -> Book:
        new_book = Book(**book_data.model_dump())
        db_session.add(new_book)
        await db_session.commit()
        await db_session.refresh(new_book)
        return new_book

    async def get_book_by_subject_id(self, subject_id: str, db_session: AsyncSession) -> Book:
        result = await db_session.execute(select(Book).where(Book.subject_id == subject_id))
        return result.scalars().all()
    
    async def get_book_by_class_id(self, class_id: str, db_session: AsyncSession) -> Book:
        result = await db_session.execute(select(Book).where(Book.class_id == class_id))
        return result.scalars().all()
    
    async def get_book_by_id(self, book_id: str, db_session: AsyncSession) -> Book:
        result = await db_session.execute(select(Book).where(Book.uid == book_id))
        return result.scalar_one_or_none()
    
    async def update_book(self, book_id: str, book_data: BookUpdate, db_session: AsyncSession) -> Book:
        book = await self.get_book_by_id(book_id, db_session)
        if not book:
            return None
        for key, value in book_data.model_dump(exclude_unset=True).items():
            setattr(book, key, value)
        await db_session.commit()
        await db_session.refresh(book)
        return book

    async def delete_book(self, book_id: str, db_session: AsyncSession) -> bool:
        book = await self.get_book_by_id(book_id, db_session)
        if not book:
            return False
        await db_session.delete(book)
        await db_session.commit()
        return True
