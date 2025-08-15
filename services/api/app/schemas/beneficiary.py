from pydantic import BaseModel, ConfigDict
from datetime import datetime, date
from typing import Optional

class BeneficiaryBase(BaseModel):
    program_id: int
    application_id: int
    enrollment_date: date
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    household_size: Optional[int] = None
    monthly_income: Optional[int] = None

class BeneficiaryCreate(BeneficiaryBase):
    user_id: int

class BeneficiaryUpdate(BaseModel):
    completion_date: Optional[date] = None
    status: Optional[str] = None
    progress_notes: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    household_size: Optional[int] = None
    monthly_income: Optional[int] = None

class BeneficiaryInDBBase(BeneficiaryBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    user_id: int
    completion_date: Optional[date] = None
    status: str
    progress_notes: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

class Beneficiary(BeneficiaryInDBBase):
    pass

class BeneficiaryInDB(BeneficiaryInDBBase):
    pass