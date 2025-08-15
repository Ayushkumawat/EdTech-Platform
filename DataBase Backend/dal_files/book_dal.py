from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload
from uuid import UUID
from models.book import Book
from models.subject import Subject
from schemas.book_schemas import BookCreate, BookUpdate

class BookDAL:
    async def book_exists(self, book_id: str, db_session: AsyncSession) -> bool:
        result = await db_session.execute(select(Book).where(Book.uid == book_id))
        return result.scalar_one_or_none() is not None

    async def get_all_books(self, db_session: AsyncSession) -> list[Book]:
        result = await db_session.execute(select(Book).options(joinedload(Book.subject)))
        return result.scalars().all()

    async def create_book(self, book_data: BookCreate, db_session: AsyncSession) -> Book:
        # Create a copy of the data and remove subject_name as it's not a column in the Book model
        book_dict = book_data.model_dump()
        # Remove subject_name as it's not a column in the Book model
        if 'subject_name' in book_dict:
            book_dict.pop('subject_name')
        
        new_book = Book(**book_dict)
        db_session.add(new_book)
        await db_session.commit()
        await db_session.refresh(new_book)
        return new_book

    async def get_book_by_subject_id(self, subject_id: str, db_session: AsyncSession) -> list[Book]:
        result = await db_session.execute(
            select(Book)
            .where(Book.subject_id == subject_id)
            .options(joinedload(Book.subject))
        )
        return result.scalars().all()
    
    async def get_book_by_class_id(self, class_id: str, db_session: AsyncSession) -> list[Book]:
        result = await db_session.execute(
            select(Book)
            .where(Book.class_id == class_id)
            .options(joinedload(Book.subject))
        )
        return result.scalars().all()
    
    async def get_book_by_id(self, book_id: str, db_session: AsyncSession) -> Book:
        result = await db_session.execute(
            select(Book)
            .where(Book.uid == book_id)
            .options(joinedload(Book.subject))
        )
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
