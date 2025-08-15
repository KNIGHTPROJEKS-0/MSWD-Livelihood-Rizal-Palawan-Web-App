from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Boolean, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .user import Base

class Beneficiary(Base):
    __tablename__ = "beneficiaries"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    program_id = Column(Integer, ForeignKey("programs.id"), nullable=False)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False)
    
    # Beneficiary specific information
    enrollment_date = Column(Date, nullable=False)
    completion_date = Column(Date)
    status = Column(String(50), default="active", nullable=False)  # active, completed, dropped, suspended
    progress_notes = Column(Text)
    
    # Contact and personal details
    emergency_contact_name = Column(String(255))
    emergency_contact_phone = Column(String(20))
    household_size = Column(Integer)
    monthly_income = Column(Integer)  # in cents
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="beneficiaries")
    program = relationship("Program", back_populates="beneficiaries")
    application = relationship("Application")