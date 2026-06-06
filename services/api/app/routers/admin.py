from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.routers.auth import get_current_user

router = APIRouter()


@router.get("/stats")
def get_stats(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role not in ("superadmin", "admin"):
        raise HTTPException(status_code=403, detail="Not authorized")
    from app.models.user import User
    from app.models.program import Program
    from app.models.application import Application

    total_users = db.query(func.count(User.id)).filter(User.is_active == True).scalar()
    total_beneficiaries = db.query(func.count(User.id)).filter(User.role == "beneficiary", User.is_active == True).scalar()
    total_admins = db.query(func.count(User.id)).filter(User.role == "admin").scalar()
    pending_registrations = db.query(func.count(User.id)).filter(User.role == "beneficiary", User.is_active == False).scalar()
    total_programs = db.query(func.count(Program.id)).filter(Program.status == "active").scalar()
    pending_apps = db.query(func.count(Application.id)).filter(Application.status == "pending").scalar()
    approved_apps = db.query(func.count(Application.id)).filter(Application.status == "approved").scalar()
    rejected_apps = db.query(func.count(Application.id)).filter(Application.status == "rejected").scalar()
    total_apps = db.query(func.count(Application.id)).scalar()

    return {
        "total_users": total_users,
        "total_beneficiaries": total_beneficiaries,
        "total_admins": total_admins,
        "pending_registrations": pending_registrations,
        "active_programs": total_programs,
        "pending_applications": pending_apps,
        "approved_applications": approved_apps,
        "rejected_applications": rejected_apps,
        "total_applications": total_apps,
    }


@router.get("/recent-applications")
def get_recent_applications(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role not in ("superadmin", "admin"):
        raise HTTPException(status_code=403, detail="Not authorized")
    from app.models.application import Application
    from app.models.user import User
    from app.models.program import Program

    apps = (
        db.query(Application, User, Program)
        .join(User, Application.user_id == User.id)
        .join(Program, Application.program_id == Program.id)
        .order_by(Application.applied_at.desc())
        .limit(10)
        .all()
    )
    return [
        {
            "id": a.id,
            "applicant": f"{u.first_name or ''} {u.last_name or ''}".strip() or u.email,
            "program": p.title,
            "status": a.status,
            "applied_at": str(a.applied_at) if a.applied_at else None,
        }
        for a, u, p in apps
    ]
