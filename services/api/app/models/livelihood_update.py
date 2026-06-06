from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class LivelihoodUpdate(Base):
    __tablename__ = "livelihood_updates"

    id = Column(Integer, primary_key=True, index=True)
    beneficiary_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    program_id = Column(Integer, ForeignKey("programs.id"))
    title = Column(String(255), nullable=False)
    description = Column(Text)
    original_filename = Column(String(255))
    stored_filename = Column(String(255))
    file_path = Column(String(500))
    admin_notes = Column(Text)
    reviewed_by = Column(Integer, ForeignKey("users.id"))
    reviewed_at = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())

    beneficiary = relationship("User", foreign_keys=[beneficiary_id])
    program = relationship("Program", foreign_keys=[program_id])
    reviewer = relationship("User", foreign_keys=[reviewed_by])
