from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

# Shared properties
class ProgramBase(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = "active"
    max_participants: Optional[int] = None
    current_participants: Optional[int] = 0
    requirements: Optional[str] = None
    benefits: Optional[str] = None
    duration_months: Optional[int] = None
    budget: Optional[float] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    application_deadline: Optional[datetime] = None
    contact_person: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None

# Properties to receive via API on creation
class ProgramCreate(ProgramBase):
    name: str
    description: str
    category: str
    max_participants: int
    requirements: str
    benefits: str
    duration_months: int
    start_date: datetime
    end_date: datetime
    application_deadline: datetime
    contact_person: str
    contact_email: str

# Properties to receive via API on update
class ProgramUpdate(ProgramBase):
    pass

class ProgramInDBBase(ProgramBase):
    id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Additional properties to return via API
class Program(ProgramInDBBase):
    pass

# Read schema for API responses
class ProgramRead(ProgramInDBBase):
    pass

# Additional properties stored in DB
class ProgramInDB(ProgramInDBBase):
    pass

# Application schemas
class ApplicationBase(BaseModel):
    status: Optional[str] = "pending"
    notes: Optional[str] = None

class ApplicationCreate(ApplicationBase):
    user_id: int
    program_id: int

class ApplicationUpdate(ApplicationBase):
    pass

class ApplicationInDBBase(ApplicationBase):
    id: Optional[int] = None
    user_id: Optional[int] = None
    program_id: Optional[int] = None
    applied_at: Optional[datetime] = None
    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[int] = None

    class Config:
        from_attributes = True

class Application(ApplicationInDBBase):
    pass

class ApplicationInDB(ApplicationInDBBase):
    pass