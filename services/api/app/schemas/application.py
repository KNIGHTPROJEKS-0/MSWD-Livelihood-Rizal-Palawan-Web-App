from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class ApplicationBase(BaseModel):
    program_id: int
    notes: Optional[str] = None

class ApplicationCreate(ApplicationBase):
    pass

class ApplicationUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    reviewed_by: Optional[int] = None

class ApplicationInDBBase(ApplicationBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    user_id: int
    status: str
    applied_at: datetime
    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[int] = None
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

class Application(ApplicationInDBBase):
    pass

# Read schema for API responses
class ApplicationRead(ApplicationInDBBase):
    pass

class ApplicationInDB(ApplicationInDBBase):
    pass