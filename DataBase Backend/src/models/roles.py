from sqlalchemy import Column, String, TIMESTAMP, Text, Boolean,Enum
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from db.database import Base
from sqlalchemy.sql import func
from datetime import datetime
import uuid
from sqlalchemy import text


class Role(Base):
    __tablename__ = 'role'

    uid = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    name = Column(Enum('user', 'admin', 'super_admin', name='role_enum'), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    status_active = Column(Boolean, nullable=False, server_default=text('true'))
    created_at = Column(TIMESTAMP, nullable=False, server_default=text("now()"))
    updated_at = Column(TIMESTAMP, nullable=False, server_default=text("now()"))



    # Relationships
    users = relationship("User", back_populates="role")