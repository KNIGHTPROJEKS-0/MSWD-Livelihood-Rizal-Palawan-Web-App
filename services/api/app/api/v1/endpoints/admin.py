from typing import Any, List, Dict
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from datetime import datetime, timedelta

from app.api import deps
from app.core.config import settings
from app.models.user import User
from app.models.program import Program
from app.models.application import Application
from app.models.beneficiary import Beneficiary
from app.models.audit import AuditLog
from app.schemas.user import UserRead
from app.schemas.program import ProgramRead
from app.schemas.application import ApplicationRead
from app.schemas.common import ResponseModel
from app.services.user_service import user_service
from app.services.program_service import program_service
from app.services.application_service import application_service
from app.services.audit_service import audit_service

router = APIRouter()


@router.get("/dashboard", response_model=Dict[str, Any])
def get_admin_dashboard(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Get admin dashboard statistics.
    """
    # User statistics
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    new_users_this_month = db.query(User).filter(
        User.created_at >= datetime.utcnow().replace(day=1)
    ).count()
    
    # Program statistics
    total_programs = db.query(Program).count()
    active_programs = db.query(Program).filter(Program.is_active == True).count()
    featured_programs = db.query(Program).filter(
        Program.is_active == True,
        Program.is_featured == True
    ).count()
    
    # Application statistics
    total_applications = db.query(Application).count()
    pending_applications = db.query(Application).filter(
        Application.status == "pending"
    ).count()
    approved_applications = db.query(Application).filter(
        Application.status == "approved"
    ).count()
    rejected_applications = db.query(Application).filter(
        Application.status == "rejected"
    ).count()
    
    # Beneficiary statistics
    total_beneficiaries = db.query(Beneficiary).count()
    active_beneficiaries = db.query(Beneficiary).filter(
        Beneficiary.is_active == True
    ).count()
    
    # Recent activity (last 7 days)
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    recent_applications = db.query(Application).filter(
        Application.applied_at >= seven_days_ago
    ).count()
    
    recent_registrations = db.query(User).filter(
        User.created_at >= seven_days_ago
    ).count()
    
    # Programs by category
    program_categories = db.query(
        Program.category,
        func.count(Program.id).label("count")
    ).filter(
        Program.is_active == True
    ).group_by(Program.category).all()
    
    # Applications by status over time (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    application_trends = db.query(
        func.date(Application.applied_at).label("date"),
        Application.status,
        func.count(Application.id).label("count")
    ).filter(
        Application.applied_at >= thirty_days_ago
    ).group_by(
        func.date(Application.applied_at),
        Application.status
    ).all()
    
    return {
        "users": {
            "total": total_users,
            "active": active_users,
            "new_this_month": new_users_this_month,
            "recent_registrations": recent_registrations
        },
        "programs": {
            "total": total_programs,
            "active": active_programs,
            "featured": featured_programs,
            "by_category": {
                category: count for category, count in program_categories
            }
        },
        "applications": {
            "total": total_applications,
            "pending": pending_applications,
            "approved": approved_applications,
            "rejected": rejected_applications,
            "recent": recent_applications,
            "trends": [
                {
                    "date": str(date),
                    "status": status,
                    "count": count
                }
                for date, status, count in application_trends
            ]
        },
        "beneficiaries": {
            "total": total_beneficiaries,
            "active": active_beneficiaries
        }
    }


@router.get("/users/recent", response_model=List[UserRead])
def get_recent_users(
    db: Session = Depends(deps.get_db),
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Get recently registered users.
    """
    users = db.query(User).order_by(
        User.created_at.desc()
    ).limit(limit).all()
    
    return users


@router.get("/applications/pending", response_model=List[ApplicationRead])
def get_pending_applications(
    db: Session = Depends(deps.get_db),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Get pending applications for review.
    """
    applications = db.query(Application).filter(
        Application.status == "pending"
    ).order_by(
        Application.applied_at.asc()
    ).limit(limit).all()
    
    return applications


@router.get("/programs/inactive", response_model=List[ProgramRead])
def get_inactive_programs(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Get inactive programs that may need attention.
    """
    programs = db.query(Program).filter(
        Program.is_active == False
    ).order_by(
        Program.updated_at.desc()
    ).all()
    
    return programs


@router.post("/users/{user_id}/promote", response_model=ResponseModel)
def promote_user(
    *,
    db: Session = Depends(deps.get_db),
    user_id: int,
    new_role: str = Query(..., regex="^(staff|admin)$"),
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Promote user to staff or admin role.
    """
    # Only super_admin can promote to admin
    if new_role == "admin" and current_user.role != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only super admin can promote users to admin role"
        )
    
    user = user_service.get_user(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Cannot promote yourself
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot promote yourself"
        )
    
    # Update user role
    user.role = new_role
    db.commit()
    
    # Log audit trail
    audit_service.log_action(
        db=db,
        user_id=current_user.id,
        action="USER_PROMOTED",
        details=f"User {user.email} promoted to {new_role}"
    )
    
    return ResponseModel(message=f"User promoted to {new_role} successfully")


@router.post("/users/{user_id}/demote", response_model=ResponseModel)
def demote_user(
    *,
    db: Session = Depends(deps.get_db),
    user_id: int,
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Demote user to regular user role.
    """
    user = user_service.get_user(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Cannot demote yourself
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot demote yourself"
        )
    
    # Cannot demote super_admin
    if user.role == "super_admin":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot demote super admin"
        )
    
    # Only super_admin can demote admin
    if user.role == "admin" and current_user.role != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only super admin can demote admin users"
        )
    
    old_role = user.role
    user.role = "user"
    db.commit()
    
    # Log audit trail
    audit_service.log_action(
        db=db,
        user_id=current_user.id,
        action="USER_DEMOTED",
        details=f"User {user.email} demoted from {old_role} to user"
    )
    
    return ResponseModel(message="User demoted successfully")


@router.get("/audit-logs", response_model=List[Dict[str, Any]])
def get_audit_logs(
    db: Session = Depends(deps.get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    action: str = Query(None, description="Filter by action type"),
    user_id: int = Query(None, description="Filter by user ID"),
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Get audit logs with filtering.
    """
    query = db.query(AuditLog)
    
    # Apply filters
    if action:
        query = query.filter(AuditLog.action == action)
    if user_id:
        query = query.filter(AuditLog.user_id == user_id)
    
    # Get logs with pagination
    logs = query.order_by(
        AuditLog.created_at.desc()
    ).offset(skip).limit(limit).all()
    
    # Format response
    formatted_logs = []
    for log in logs:
        user = db.query(User).filter(User.id == log.user_id).first()
        formatted_logs.append({
            "id": log.id,
            "action": log.action,
            "details": log.details,
            "created_at": log.created_at,
            "user": {
                "id": user.id if user else None,
                "email": user.email if user else "Unknown",
                "name": f"{user.first_name} {user.last_name}" if user else "Unknown"
            } if user else None
        })
    
    return formatted_logs


@router.post("/system/backup", response_model=ResponseModel)
def create_system_backup(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Create system backup (placeholder for actual backup implementation).
    """
    # This would typically trigger a background task for database backup
    # For now, we'll just log the action
    
    audit_service.log_action(
        db=db,
        user_id=current_user.id,
        action="SYSTEM_BACKUP_REQUESTED",
        details="System backup requested by admin"
    )
    
    return ResponseModel(message="System backup initiated successfully")


@router.get("/system/health", response_model=Dict[str, Any])
def get_system_health(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Get system health status.
    """
    try:
        # Test database connection
        db.execute(text("SELECT 1"))
        db_status = "healthy"
    except Exception:
        db_status = "unhealthy"
    
    # Get basic system stats
    total_records = {
        "users": db.query(User).count(),
        "programs": db.query(Program).count(),
        "applications": db.query(Application).count(),
        "beneficiaries": db.query(Beneficiary).count(),
        "audit_logs": db.query(AuditLog).count()
    }
    
    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "database": db_status,
        "timestamp": datetime.utcnow(),
        "total_records": total_records,
        "version": "1.0.0"
    }


@router.post("/maintenance/cleanup", response_model=ResponseModel)
def cleanup_old_data(
    db: Session = Depends(deps.get_db),
    days: int = Query(90, ge=30, le=365, description="Delete audit logs older than X days"),
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Cleanup old audit logs and inactive data.
    """
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    
    # Delete old audit logs
    deleted_logs = db.query(AuditLog).filter(
        AuditLog.created_at < cutoff_date
    ).delete()
    
    db.commit()
    
    # Log the cleanup action
    audit_service.log_action(
        db=db,
        user_id=current_user.id,
        action="SYSTEM_CLEANUP",
        details=f"Cleaned up {deleted_logs} audit logs older than {days} days"
    )
    
    return ResponseModel(
        message=f"Cleanup completed. Removed {deleted_logs} old audit logs."
    )