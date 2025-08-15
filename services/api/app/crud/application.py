from typing import List, Optional
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.application import Application
from app.schemas.application import ApplicationCreate, ApplicationUpdate

class CRUDApplication(CRUDBase[Application, ApplicationCreate, ApplicationUpdate]):
    def get_by_user_and_program(
        self, db: Session, *, user_id: int, program_id: int
    ) -> Optional[Application]:
        return (
            db.query(Application)
            .filter(Application.user_id == user_id)
            .filter(Application.program_id == program_id)
            .filter(Application.is_active == True)
            .first()
        )
    
    def get_by_user(
        self, db: Session, *, user_id: int, skip: int = 0, limit: int = 100
    ) -> List[Application]:
        return (
            db.query(Application)
            .filter(Application.user_id == user_id)
            .filter(Application.is_active == True)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_by_program(
        self, db: Session, *, program_id: int, skip: int = 0, limit: int = 100
    ) -> List[Application]:
        return (
            db.query(Application)
            .filter(Application.program_id == program_id)
            .filter(Application.is_active == True)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_by_status(
        self, db: Session, *, status: str, skip: int = 0, limit: int = 100
    ) -> List[Application]:
        return (
            db.query(Application)
            .filter(Application.status == status)
            .filter(Application.is_active == True)
            .offset(skip)
            .limit(limit)
            .all()
        )

application = CRUDApplication(Application)