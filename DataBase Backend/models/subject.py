from sqlalchemy import Column, String, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship
from db.database import Base
import uuid

class Subject(Base):
    __tablename__ = 'subject'

    uid = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    class_id = Column(PG_UUID(as_uuid=True), ForeignKey('class.uid'), nullable=False)

    class_ = relationship("Class", back_populates="subjects", lazy="selectin")
    books = relationship("Book", back_populates="subject", lazy="selectin")

    __table_args__ = ()
