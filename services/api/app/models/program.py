from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Date
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Program(Base):
    __tablename__ = "programs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    category = Column(String(100))
    status = Column(String(50), default="active")
    max_participants = Column(Integer)
    current_participants = Column(Integer, default=0)
    start_date = Column(Date)
    end_date = Column(Date)
    location = Column(String)
    requirements = Column(Text)
    budget = Column(String(100))
    created_by = Column(Integer)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    applications = relationship("Application", back_populates="program", lazy="dynamic")
    beneficiaries = relationship("Beneficiary", foreign_keys="[Beneficiary.program_id]", back_populates="program", lazy="dynamic")
