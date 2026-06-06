import os
import uuid
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form as FormField
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.routers.auth import get_current_user

router = APIRouter()
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


class UpdateReview(BaseModel):
    admin_notes: str


def update_to_dict(u, beneficiary=None, program=None, reviewer=None):
    return {
        "id": u.id,
        "beneficiary_id": u.beneficiary_id,
        "beneficiary_name": f"{beneficiary.first_name or ''} {beneficiary.last_name or ''}".strip() if beneficiary else None,
        "beneficiary_barangay": beneficiary.barangay if beneficiary else None,
        "program_id": u.program_id,
        "program_title": program.title if program else None,
        "title": u.title,
        "description": u.description,
        "original_filename": u.original_filename,
        "file_url": f"/uploads/{u.stored_filename}" if u.stored_filename else None,
        "admin_notes": u.admin_notes,
        "reviewed_by": u.reviewed_by,
        "reviewer_name": f"{reviewer.first_name or ''} {reviewer.last_name or ''}".strip() if reviewer else None,
        "reviewed_at": str(u.reviewed_at) if u.reviewed_at else None,
        "created_at": str(u.created_at) if u.created_at else None,
    }


@router.get("/")
def list_updates(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    from app.models.livelihood_update import LivelihoodUpdate
    from app.models.user import User
    from app.models.program import Program

    if current_user.role in ("superadmin", "admin"):
        updates = db.query(LivelihoodUpdate).order_by(LivelihoodUpdate.created_at.desc()).all()
    else:
        updates = db.query(LivelihoodUpdate).filter(
            LivelihoodUpdate.beneficiary_id == current_user.id
        ).order_by(LivelihoodUpdate.created_at.desc()).all()

    result = []
    for u in updates:
        beneficiary = db.query(User).filter(User.id == u.beneficiary_id).first()
        program = db.query(Program).filter(Program.id == u.program_id).first() if u.program_id else None
        reviewer = db.query(User).filter(User.id == u.reviewed_by).first() if u.reviewed_by else None
        result.append(update_to_dict(u, beneficiary, program, reviewer))
    return result


@router.post("/")
async def create_update(
    title: str = FormField(...),
    description: Optional[str] = FormField(None),
    program_id: Optional[int] = FormField(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role != "beneficiary":
        raise HTTPException(status_code=403, detail="Only beneficiaries can submit livelihood updates")

    from app.models.livelihood_update import LivelihoodUpdate
    from app.models.program import Program

    stored_filename = None
    original_filename = None
    file_path = None

    if file and file.filename:
        ext = os.path.splitext(file.filename)[1]
        stored_filename = f"{uuid.uuid4()}{ext}"
        file_path = os.path.join(UPLOAD_DIR, stored_filename)
        content = await file.read()
        with open(file_path, "wb") as f_:
            f_.write(content)
        original_filename = file.filename

    update = LivelihoodUpdate(
        beneficiary_id=current_user.id,
        program_id=program_id,
        title=title,
        description=description,
        original_filename=original_filename,
        stored_filename=stored_filename,
        file_path=file_path,
    )
    db.add(update)
    db.commit()
    db.refresh(update)

    program = db.query(Program).filter(Program.id == program_id).first() if program_id else None
    return update_to_dict(update, current_user, program)


@router.get("/{update_id}")
def get_update(update_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    from app.models.livelihood_update import LivelihoodUpdate
    from app.models.user import User
    from app.models.program import Program

    u = db.query(LivelihoodUpdate).filter(LivelihoodUpdate.id == update_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="Update not found")
    if current_user.role == "beneficiary" and u.beneficiary_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    beneficiary = db.query(User).filter(User.id == u.beneficiary_id).first()
    program = db.query(Program).filter(Program.id == u.program_id).first() if u.program_id else None
    reviewer = db.query(User).filter(User.id == u.reviewed_by).first() if u.reviewed_by else None
    return update_to_dict(u, beneficiary, program, reviewer)


@router.patch("/{update_id}/review")
def review_update(update_id: int, data: UpdateReview, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role not in ("superadmin", "admin"):
        raise HTTPException(status_code=403, detail="Not authorized")

    from app.models.livelihood_update import LivelihoodUpdate
    from app.models.user import User
    from app.models.program import Program

    u = db.query(LivelihoodUpdate).filter(LivelihoodUpdate.id == update_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="Update not found")

    u.admin_notes = data.admin_notes
    u.reviewed_by = current_user.id
    u.reviewed_at = datetime.utcnow()
    db.commit()
    db.refresh(u)

    beneficiary = db.query(User).filter(User.id == u.beneficiary_id).first()
    program = db.query(Program).filter(Program.id == u.program_id).first() if u.program_id else None
    reviewer = db.query(User).filter(User.id == u.reviewed_by).first()
    return update_to_dict(u, beneficiary, program, reviewer)
