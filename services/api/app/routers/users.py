from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.core.database import get_db
from app.routers.auth import get_current_user

router = APIRouter()


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    barangay: Optional[str] = None


@router.get("/")
def list_users(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role not in ("superadmin", "admin"):
        raise HTTPException(status_code=403, detail="Not authorized")
    from app.models.user import User
    users = db.query(User).filter(User.is_active == True).all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "first_name": u.first_name,
            "last_name": u.last_name,
            "role": u.role,
            "barangay": u.barangay,
            "is_active": u.is_active,
            "created_at": str(u.created_at) if u.created_at else None,
        }
        for u in users
    ]


@router.get("/pending")
def list_pending_users(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role not in ("superadmin", "admin"):
        raise HTTPException(status_code=403, detail="Not authorized")
    from app.models.user import User
    users = db.query(User).filter(User.is_active == False, User.role == "beneficiary").order_by(User.created_at.desc()).all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "first_name": u.first_name,
            "last_name": u.last_name,
            "role": u.role,
            "barangay": u.barangay,
            "phone": u.phone,
            "is_active": u.is_active,
            "created_at": str(u.created_at) if u.created_at else None,
        }
        for u in users
    ]


@router.patch("/{user_id}/approve")
def approve_user(user_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role not in ("superadmin", "admin"):
        raise HTTPException(status_code=403, detail="Not authorized")
    from app.models.user import User
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = True
    user.is_verified = True
    db.commit()
    return {"message": f"{user.first_name or user.email} has been approved and can now log in."}


@router.patch("/{user_id}/reject")
def reject_user(user_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role not in ("superadmin", "admin"):
        raise HTTPException(status_code=403, detail="Not authorized")
    from app.models.user import User
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": "Registration rejected and removed."}


@router.put("/{user_id}")
def update_user(user_id: int, data: UserUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    from app.models.user import User
    if current_user.id != user_id and current_user.role not in ("superadmin", "admin"):
        raise HTTPException(status_code=403, detail="Not authorized")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    for field, value in data.dict(exclude_none=True).items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return {"id": user.id, "email": user.email, "first_name": user.first_name, "last_name": user.last_name, "role": user.role}


@router.patch("/{user_id}/role")
def update_user_role(user_id: int, role: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role != "superadmin":
        raise HTTPException(status_code=403, detail="Only superadmin can change roles")
    if role not in ("superadmin", "admin", "beneficiary"):
        raise HTTPException(status_code=400, detail="Invalid role")
    from app.models.user import User
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = role
    if role in ("admin", "superadmin"):
        user.is_active = True
    db.commit()
    return {"message": f"Role updated to {role}"}


@router.patch("/{user_id}/toggle-active")
def toggle_user_active(user_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role not in ("superadmin", "admin"):
        raise HTTPException(status_code=403, detail="Not authorized")
    from app.models.user import User
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = not user.is_active
    db.commit()
    return {"message": f"User {'activated' if user.is_active else 'deactivated'}", "is_active": user.is_active}
