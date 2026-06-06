from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import Optional
from datetime import date

from app.core.database import get_db
from app.routers.auth import get_current_user

router = APIRouter()


class ProgramCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = "active"
    max_participants: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    location: Optional[str] = None
    requirements: Optional[str] = None
    budget: Optional[str] = None


class ProgramUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None
    max_participants: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    location: Optional[str] = None
    requirements: Optional[str] = None
    budget: Optional[str] = None


def program_to_dict(p, approved_count=None):
    return {
        "id": p.id,
        "title": p.title,
        "description": p.description,
        "category": p.category,
        "status": p.status,
        "max_participants": p.max_participants,
        "current_participants": approved_count if approved_count is not None else (p.current_participants or 0),
        "start_date": str(p.start_date) if p.start_date else None,
        "end_date": str(p.end_date) if p.end_date else None,
        "location": p.location,
        "requirements": p.requirements,
        "budget": p.budget,
        "created_at": str(p.created_at) if p.created_at else None,
    }


def get_approved_counts(db: Session):
    from app.models.application import Application
    rows = (
        db.query(Application.program_id, func.count(Application.id))
        .filter(Application.status == "approved")
        .group_by(Application.program_id)
        .all()
    )
    return dict(rows)


@router.get("/")
def list_programs(db: Session = Depends(get_db)):
    from app.models.program import Program
    programs = db.query(Program).filter(Program.status != "deleted").all()
    counts = get_approved_counts(db)
    return [program_to_dict(p, counts.get(p.id, 0)) for p in programs]


@router.get("/{program_id}")
def get_program(program_id: int, db: Session = Depends(get_db)):
    from app.models.program import Program
    from app.models.application import Application
    p = db.query(Program).filter(Program.id == program_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Program not found")
    count = db.query(func.count(Application.id)).filter(
        Application.program_id == program_id,
        Application.status == "approved"
    ).scalar() or 0
    return program_to_dict(p, count)


@router.post("/")
def create_program(data: ProgramCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role not in ("superadmin", "admin"):
        raise HTTPException(status_code=403, detail="Not authorized")
    from app.models.program import Program
    program = Program(**data.dict(), created_by=current_user.id, current_participants=0)
    db.add(program)
    db.commit()
    db.refresh(program)
    return program_to_dict(program, 0)


@router.put("/{program_id}")
def update_program(program_id: int, data: ProgramUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role not in ("superadmin", "admin"):
        raise HTTPException(status_code=403, detail="Not authorized")
    from app.models.program import Program
    from app.models.application import Application
    program = db.query(Program).filter(Program.id == program_id).first()
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")
    for field, value in data.dict(exclude_none=True).items():
        setattr(program, field, value)
    db.commit()
    db.refresh(program)
    count = db.query(func.count(Application.id)).filter(
        Application.program_id == program_id,
        Application.status == "approved"
    ).scalar() or 0
    return program_to_dict(program, count)


@router.delete("/{program_id}")
def delete_program(program_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role != "superadmin":
        raise HTTPException(status_code=403, detail="Only superadmin can delete programs")
    from app.models.program import Program
    program = db.query(Program).filter(Program.id == program_id).first()
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")
    program.status = "deleted"
    db.commit()
    return {"message": "Program deleted"}
