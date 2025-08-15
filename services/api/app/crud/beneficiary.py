from typing import List, Optional
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.beneficiary import Beneficiary
from app.schemas.beneficiary import BeneficiaryCreate, BeneficiaryUpdate

class CRUDBeneficiary(CRUDBase[Beneficiary, BeneficiaryCreate, BeneficiaryUpdate]):
    def get_by_user(
        self, db: Session, *, user_id: int, skip: int = 0, limit: int = 100
    ) -> List[Beneficiary]:
        return (
            db.query(Beneficiary)
            .filter(Beneficiary.user_id == user_id)
            .filter(Beneficiary.is_active == True)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_by_program(
        self, db: Session, *, program_id: int, skip: int = 0, limit: int = 100
    ) -> List[Beneficiary]:
        return (
            db.query(Beneficiary)
            .filter(Beneficiary.program_id == program_id)
            .filter(Beneficiary.is_active == True)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_by_status(
        self, db: Session, *, status: str, skip: int = 0, limit: int = 100
    ) -> List[Beneficiary]:
        return (
            db.query(Beneficiary)
            .filter(Beneficiary.status == status)
            .filter(Beneficiary.is_active == True)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_active_by_program(
        self, db: Session, *, program_id: int
    ) -> List[Beneficiary]:
        return (
            db.query(Beneficiary)
            .filter(Beneficiary.program_id == program_id)
            .filter(Beneficiary.status == "active")
            .filter(Beneficiary.is_active == True)
            .all()
        )

beneficiary = CRUDBeneficiary(Beneficiary)