from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class FormDocument(Base):
    __tablename__ = "form_documents"

    id = Column(Integer, primary_key=True, index=True)
    case_form_id = Column(Integer, ForeignKey("case_forms.id"), nullable=False)
    document_type = Column(String(100), nullable=False)
    original_filename = Column(String(255))
    stored_filename = Column(String(255))
    file_path = Column(String(500))
    uploaded_at = Column(DateTime, server_default=func.now())

    case_form = relationship("CaseForm", back_populates="documents")
