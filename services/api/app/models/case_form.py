from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class CaseForm(Base):
    __tablename__ = "case_forms"

    id = Column(Integer, primary_key=True, index=True)
    form_type = Column(String(50), nullable=False)
    beneficiary_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String(50), default="draft", nullable=False)
    form_data = Column(JSON, default={})
    admin_notes = Column(Text)
    reviewed_by = Column(Integer, ForeignKey("users.id"))
    submitted_at = Column(DateTime)
    reviewed_at = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    beneficiary = relationship("User", foreign_keys=[beneficiary_id])
    reviewer = relationship("User", foreign_keys=[reviewed_by])
    documents = relationship("FormDocument", back_populates="case_form", cascade="all, delete-orphan")
