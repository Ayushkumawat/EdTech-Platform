from sqlalchemy import Column, String, Text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship
from db.database import Base
import uuid

class Class(Base):
    __tablename__ = 'class'

    uid = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    board = Column(String(255), nullable=False)

    users = relationship("User", back_populates="class_", lazy="selectin")
    subjects = relationship("Subject", back_populates="class_", lazy="selectin")
    books = relationship("Book", back_populates="class_", lazy="selectin")

    __table_args__ = ()
