from pydantic import BaseModel
from typing import Optional, Generic, TypeVar, List

T = TypeVar('T')

class PaginationParams(BaseModel):
    skip: int = 0
    limit: int = 100

class ResponseModel(BaseModel, Generic[T]):
    success: bool = True
    message: Optional[str] = None
    data: Optional[T] = None

class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    skip: int
    limit: int
    has_next: bool
    has_prev: bool

class MessageResponse(BaseModel):
    message: str