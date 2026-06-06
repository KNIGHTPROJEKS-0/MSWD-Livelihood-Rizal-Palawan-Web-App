from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    first_name = Column(String(100))
    last_name = Column(String(100))
    phone = Column(String(20))
    role = Column(String(20), nullable=False, default="beneficiary")
    barangay = Column(String(100))
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    applications = relationship("Application", foreign_keys="[Application.user_id]", back_populates="user", lazy="dynamic")
    beneficiaries = relationship("Beneficiary", foreign_keys="[Beneficiary.user_id]", back_populates="user", lazy="dynamic")
    audit_logs = relationship("AuditLog", foreign_keys="[AuditLog.user_id]", back_populates="user", lazy="dynamic")

    @property
    def full_name(self):
        parts = [self.first_name, self.last_name]
        return " ".join(p for p in parts if p) or self.email
