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

FORM_TYPES = {"assessment_tool", "intake_assessment", "social_case_study"}
DOCUMENT_TYPES = {"barangay_certificate", "medical_certificate", "government_id", "hospital_bill"}


class FormCreate(BaseModel):
    form_type: str
    form_data: Optional[dict] = {}


class FormUpdate(BaseModel):
    form_data: dict


class FormReview(BaseModel):
    status: str
    admin_notes: Optional[str] = None


def doc_to_dict(d):
    return {
        "id": d.id,
        "case_form_id": d.case_form_id,
        "document_type": d.document_type,
        "original_filename": d.original_filename,
        "stored_filename": d.stored_filename,
        "file_url": f"/uploads/{d.stored_filename}" if d.stored_filename else None,
        "uploaded_at": str(d.uploaded_at) if d.uploaded_at else None,
    }


def form_to_dict(f, beneficiary=None, reviewer=None, documents=None):
    return {
        "id": f.id,
        "form_type": f.form_type,
        "beneficiary_id": f.beneficiary_id,
        "beneficiary_name": f"{beneficiary.first_name or ''} {beneficiary.last_name or ''}".strip() if beneficiary else None,
        "beneficiary_email": beneficiary.email if beneficiary else None,
        "beneficiary_barangay": beneficiary.barangay if beneficiary else None,
        "status": f.status,
        "form_data": f.form_data or {},
        "admin_notes": f.admin_notes,
        "reviewed_by": f.reviewed_by,
        "reviewer_name": f"{reviewer.first_name or ''} {reviewer.last_name or ''}".strip() if reviewer else None,
        "submitted_at": str(f.submitted_at) if f.submitted_at else None,
        "reviewed_at": str(f.reviewed_at) if f.reviewed_at else None,
        "created_at": str(f.created_at) if f.created_at else None,
        "updated_at": str(f.updated_at) if f.updated_at else None,
        "documents": [doc_to_dict(d) for d in (documents or [])],
    }


def get_form_with_details(form_id, db, current_user=None):
    from app.models.case_form import CaseForm
    from app.models.form_document import FormDocument
    from app.models.user import User

    form = db.query(CaseForm).filter(CaseForm.id == form_id).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    if current_user and current_user.role == "beneficiary" and form.beneficiary_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    beneficiary = db.query(User).filter(User.id == form.beneficiary_id).first()
    reviewer = db.query(User).filter(User.id == form.reviewed_by).first() if form.reviewed_by else None
    docs = db.query(FormDocument).filter(FormDocument.case_form_id == form.id).all()
    return form, beneficiary, reviewer, docs


@router.get("/")
def list_forms(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    from app.models.case_form import CaseForm
    from app.models.form_document import FormDocument
    from app.models.user import User

    if current_user.role in ("superadmin", "admin"):
        forms = db.query(CaseForm).order_by(CaseForm.created_at.desc()).all()
    else:
        forms = db.query(CaseForm).filter(
            CaseForm.beneficiary_id == current_user.id
        ).order_by(CaseForm.created_at.desc()).all()

    result = []
    for f in forms:
        beneficiary = db.query(User).filter(User.id == f.beneficiary_id).first()
        reviewer = db.query(User).filter(User.id == f.reviewed_by).first() if f.reviewed_by else None
        docs = db.query(FormDocument).filter(FormDocument.case_form_id == f.id).all()
        result.append(form_to_dict(f, beneficiary, reviewer, docs))
    return result


@router.post("/")
def create_form(data: FormCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role != "beneficiary":
        raise HTTPException(status_code=403, detail="Only beneficiaries can create forms")
    if data.form_type not in FORM_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid form_type. Must be one of: {list(FORM_TYPES)}")
    from app.models.case_form import CaseForm
    form = CaseForm(
        form_type=data.form_type,
        beneficiary_id=current_user.id,
        status="draft",
        form_data=data.form_data or {},
    )
    db.add(form)
    db.commit()
    db.refresh(form)
    return form_to_dict(form, current_user)


@router.get("/{form_id}")
def get_form(form_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    form, beneficiary, reviewer, docs = get_form_with_details(form_id, db, current_user)
    return form_to_dict(form, beneficiary, reviewer, docs)


@router.put("/{form_id}")
def update_form(form_id: int, data: FormUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    form, beneficiary, reviewer, docs = get_form_with_details(form_id, db, current_user)
    if form.status not in ("draft", "returned"):
        raise HTTPException(status_code=400, detail="Can only edit draft or returned forms")
    form.form_data = data.form_data
    db.commit()
    db.refresh(form)
    from app.models.form_document import FormDocument
    docs = db.query(FormDocument).filter(FormDocument.case_form_id == form.id).all()
    return form_to_dict(form, beneficiary, reviewer, docs)


@router.post("/{form_id}/submit")
def submit_form(form_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    form, beneficiary, reviewer, docs = get_form_with_details(form_id, db, current_user)
    if form.beneficiary_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if form.status not in ("draft", "returned"):
        raise HTTPException(status_code=400, detail="Can only submit draft or returned forms")
    form.status = "submitted"
    form.submitted_at = datetime.utcnow()
    db.commit()
    db.refresh(form)
    from app.models.form_document import FormDocument
    docs = db.query(FormDocument).filter(FormDocument.case_form_id == form.id).all()
    return form_to_dict(form, beneficiary, None, docs)


@router.patch("/{form_id}/review")
def review_form(form_id: int, data: FormReview, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role not in ("superadmin", "admin"):
        raise HTTPException(status_code=403, detail="Not authorized")
    if data.status not in ("under_review", "approved", "rejected", "returned"):
        raise HTTPException(status_code=400, detail="Invalid review status")
    form, beneficiary, _, docs = get_form_with_details(form_id, db, None)
    form.status = data.status
    form.admin_notes = data.admin_notes
    form.reviewed_by = current_user.id
    form.reviewed_at = datetime.utcnow()
    db.commit()
    db.refresh(form)
    from app.models.form_document import FormDocument
    from app.models.user import User
    docs = db.query(FormDocument).filter(FormDocument.case_form_id == form.id).all()
    reviewer = db.query(User).filter(User.id == form.reviewed_by).first()
    return form_to_dict(form, beneficiary, reviewer, docs)


@router.post("/{form_id}/documents")
async def upload_document(
    form_id: int,
    document_type: str = FormField(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.models.case_form import CaseForm
    from app.models.form_document import FormDocument

    form = db.query(CaseForm).filter(CaseForm.id == form_id).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    if current_user.role == "beneficiary" and form.beneficiary_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if document_type not in DOCUMENT_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid document_type. Must be one of: {list(DOCUMENT_TYPES)}")

    ext = os.path.splitext(file.filename or "")[1]
    stored_filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(UPLOAD_DIR, stored_filename)
    content = await file.read()
    with open(file_path, "wb") as f_:
        f_.write(content)

    existing = db.query(FormDocument).filter(
        FormDocument.case_form_id == form_id,
        FormDocument.document_type == document_type,
    ).first()

    if existing:
        old_path = os.path.join(UPLOAD_DIR, existing.stored_filename or "")
        if existing.stored_filename and os.path.exists(old_path):
            os.remove(old_path)
        existing.original_filename = file.filename
        existing.stored_filename = stored_filename
        existing.file_path = file_path
        db.commit()
        db.refresh(existing)
        return doc_to_dict(existing)

    doc = FormDocument(
        case_form_id=form_id,
        document_type=document_type,
        original_filename=file.filename,
        stored_filename=stored_filename,
        file_path=file_path,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc_to_dict(doc)


@router.get("/{form_id}/documents")
def list_documents(form_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    form, _, _, docs = get_form_with_details(form_id, db, current_user)
    return [doc_to_dict(d) for d in docs]
