from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from ..core.database import Base

class ProgramStatus(str, enum.Enum):
    UPCOMING = "upcoming"
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class ProgramCategory(str, enum.Enum):
    SKILLS_TRAINING = "skills_training"
    AGRICULTURE = "agriculture"
    BUSINESS = "business"
    FOOD_TECHNOLOGY = "food_technology"
    HANDICRAFTS = "handicrafts"
    TECHNOLOGY = "technology"

class Program(Base):
    __tablename__ = "programs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    category = Column(Enum(ProgramCategory), nullable=False)
    status = Column(Enum(ProgramStatus), default=ProgramStatus.UPCOMING)
    max_participants = Column(Integer, nullable=False)
    current_participants = Column(Integer, default=0)
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=False)
    location = Column(String, nullable=True)
    requirements = Column(Text, nullable=True)
    budget = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    applications = relationship("Application", back_populates="program")
    beneficiaries = relationship("Beneficiary", back_populates="program")