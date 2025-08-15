"""CRUD Operations Package"""
from app.crud.base import CRUDBase
from app.crud.user import user
from app.crud.program import program
from app.crud.application import application
from app.crud.beneficiary import beneficiary

__all__ = [
    "CRUDBase",
    "user",
    "program",
    "application",
    "beneficiary"
]