from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.core.database import get_db
from app.routers.auth import get_current_user

router = APIRouter()


class ApplicationCreate(BaseModel):
    program_id: int
    notes: Optional[str] = None
    business_name: Optional[str] = None
    business_description: Optional[str] = None
    requested_amount: Optional[float] = None


class ApplicationReview(BaseModel):
    status: str
    notes: Optional[str] = None


def app_to_dict(a):
    return {
        "id": a.id,
        "user_id": a.user_id,
        "program_id": a.program_id,
        "status": a.status,
        "notes": a.notes,
        "business_name": a.business_name,
        "business_description": a.business_description,
        "requested_amount": float(a.requested_amount) if a.requested_amount else None,
        "applied_at": str(a.applied_at) if a.applied_at else None,
        "reviewed_at": str(a.reviewed_at) if a.reviewed_at else None,
    }


@router.get("/")
def list_applications(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    from app.models.application import Application
    if current_user.role in ("superadmin", "admin"):
        apps = db.query(Application).all()
    else:
        apps = db.query(Application).filter(Application.user_id == current_user.id).all()
    return [app_to_dict(a) for a in apps]


@router.post("/")
def create_application(data: ApplicationCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    from app.models.application import Application
    from app.models.program import Program
    program = db.query(Program).filter(Program.id == data.program_id).first()
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")
    existing = db.query(Application).filter(
        Application.user_id == current_user.id,
        Application.program_id == data.program_id,
        Application.status.in_(["pending", "approved"]),
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You already have an active application for this program")
    app = Application(
        user_id=current_user.id,
        program_id=data.program_id,
        notes=data.notes,
        business_name=data.business_name,
        business_description=data.business_description,
        requested_amount=data.requested_amount,
        status="pending",
    )
    db.add(app)
    db.commit()
    db.refresh(app)
    return app_to_dict(app)


@router.patch("/{app_id}/review")
def review_application(app_id: int, data: ApplicationReview, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role not in ("superadmin", "admin"):
        raise HTTPException(status_code=403, detail="Not authorized")
    if data.status not in ("approved", "rejected"):
        raise HTTPException(status_code=400, detail="Status must be 'approved' or 'rejected'")
    from app.models.application import Application
    from datetime import datetime
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    app.status = data.status
    app.reviewed_by = current_user.id
    app.reviewed_at = datetime.utcnow()
    if data.notes:
        app.notes = data.notes
    db.commit()
    db.refresh(app)
    return app_to_dict(app)


@router.delete("/{app_id}")
def withdraw_application(app_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    from app.models.application import Application
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    if app.user_id != current_user.id and current_user.role not in ("superadmin", "admin"):
        raise HTTPException(status_code=403, detail="Not authorized")
    if app.status == "approved":
        raise HTTPException(status_code=400, detail="Cannot withdraw an approved application")
    app.status = "withdrawn"
    db.commit()
    return {"message": "Application withdrawn"}
